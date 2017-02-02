function loadClient() {
	gapi.load('client:auth2', initClient);
}

function initClient() {
	gapi.client.init({
		apiKey: 'AIzaSyCHfi-CwE2kwvnnzhmgM8OJ1JCr_uVpWrE',
		discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"],
		clientId: '580651672131-jtssc1pntv3339uh8t5rgprcs0as3l7d.apps.googleusercontent.com',
		scope: 'https://www.googleapis.com/auth/youtube.readonly'
	}).then(function () {
		gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
		updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
	});
}

function handleAuthClick(event) {
	gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
	gapi.auth2.getAuthInstance().signOut();
}

function updateSigninStatus(isSignedIn) {
	if (isSignedIn) {
		reqSubbedChannels().then(function(channelIds) {
			reqChannelDetails(channelIds).then(function(channelDetails) {
				channelDetails.sort(function(a, b) {
									return new Date(a.publishedAt) -
											new Date(b.publishedAt);
								});
				reqUploadsPageTokens(channelDetails[0].uploadsId)
					.then(function(uploadsPageTokens) {
						reqUploads(channelDetails[0].uploadsId,
							uploadsPageTokens[uploadsPageTokens.length - 1])
							.then(function(uploads) {
								for(var i = 0; i < uploads.length; i++) {
									var subFeed = document.getElementById("sub-feed");

									var subFeedItem = document.createElement("div");
									subFeedItem.id = "sub-feed-item";

									var imgLink = document.createElement("a");
									var img = document.createElement("img");
									img.src = uploads[i].snippet.thumbnails.high.url;
									imgLink.appendChild(img);
									imgLink.href = `https://www.youtube.com/watch?v=
											${uploads[i].snippet.resourceId.videoId}`;
									imgLink.alt = uploads[i].snippet.title;

									var titleLink = document.createElement("a");
									var linkText = document.createTextNode(uploads[i].snippet.title);
									titleLink.appendChild(linkText);
									titleLink.href = `https://www.youtube.com/watch?v=
												${uploads[i].snippet.resourceId.videoId}`;
									titleLink.alt = uploads[i].snippet.title;

									subFeedItem.appendChild(imgLink);
									subFeedItem.appendChild(titleLink);
									subFeed.appendChild(subFeedItem);
								}
							}).catch(function(reason) {
								console.log(reason);
						});
						uploadsPageTokens.splice(uploadsPageTokens.length - 1);
					}).catch(function(reason) {
						console.log(reason);
				});
			}).catch(function(reason) {
				console.log(reason);
			});
		}).catch(function(reason) {
			console.log(reason);
		});
	}
}

function reqSubbedChannels(pageToken) {
	var channelIds = [];
	return new Promise(function(resolve, reject) {
		gapi.client.youtube.subscriptions.list({
			part: 'snippet',
			mine: true,
			maxResults: 50,
			pageToken: pageToken,
			order: 'alphabetical',
			fields: 'items/snippet/resourceId/channelId,nextPageToken'
		}).then(function(res) {
			for(var i = 0; i < res.result.items.length; i++) {
				channelIds.push(res.result.items[i].snippet.resourceId.channelId);
			}
			if(res.result.nextPageToken) {
				reqSubbedChannels(res.result.nextPageToken).then(function(res) {
					resolve(channelIds.concat(res));
				}).catch(function(reason) {
					reject(reason);
				});
			}
			else {
				resolve(channelIds);
			}
		}, function(reason) {
			reject(reason);
		});
	});
}

function reqChannelDetails(channelIds) {
	var channelDetails = [];
	return new Promise(function(resolve, reject) {
		gapi.client.youtube.channels.list({
			part: 'snippet,contentDetails',
			id: channelIds.slice(0, 50).join(),
			maxResults: 50,
			fields: 'items/id,items/snippet/publishedAt,' +
					'items/contentDetails/relatedPlaylists/uploads,nextPageToken'
		}).then(function(res) {
			for(var i = 0; i < res.result.items.length; i++) {
				channelDetails.push({
					channelId: res.result.items[i].id,
					publishedAt: res.result.items[i].snippet.publishedAt,
					uploadsId: res.result.items[i].contentDetails.relatedPlaylists.uploads
				});
			}
			if(channelIds.slice(50).length > 0) {
				reqChannelDetails(channelIds.slice(50)).then(function(res) {
					resolve(channelDetails.concat(res));
				}).catch(function(reason) {
					reject(reason)
				});
			}
			else {
				resolve(channelDetails);
			}
		}, function(reason) {
			reject(reason);
		});
	});
}

function reqUploadsPageTokens(uploadsId, pageToken) {
	var uploadsPageTokens = [];
	return new Promise(function(resolve, reject) {
		gapi.client.youtube.playlistItems.list({
			part: 'snippet',
			maxResults: 50,
			pageToken: pageToken,
			playlistId: uploadsId,
			fields: 'nextPageToken'
		}).then(function(res) {
			if(res.result.nextPageToken) {
				uploadsPageTokens.push(res.result.nextPageToken);
				reqUploadsPageTokens(uploadsId, res.result.nextPageToken)
					.then(function(res) {
						resolve(uploadsPageTokens.concat(res));
					}).catch(function(reason) {
						reject(reason);
					});
			}
			else {
				resolve(uploadsPageTokens);
			}
		}, function(reason) {
			reject(reason);
		});
	});
}

function reqUploads(uploadsId, pageToken) {
	var uploads = [];
	return new Promise(function(resolve, reject) {
		gapi.client.youtube.playlistItems.list({
			part: 'snippet',
			maxResults: 50,
			pageToken: pageToken,
			playlistId: uploadsId
		}).then(function(res) {
			console.log(res);
			resolve(res.result.items);
		}, function(reason) {
			reject(reason);
		});
	});
}
