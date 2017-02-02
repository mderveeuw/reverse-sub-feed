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
		requestSubbedChannels().then(function(channelIds) {
			requestChannelDetails(channelIds).then(function(channelDetails) {
				// ...
				console.log(channelDetails);
			}).catch(function(reason) {
				console.log(reason);
			});
		}).catch(function(reason) {
			console.log(reason);
		});
	}
}

function requestSubbedChannels(pageToken) {
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
				requestSubbedChannels(res.result.nextPageToken).then(function(res) {
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

function requestChannelDetails(channelIds) {
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
					uploads: res.result.items[i].contentDetails.relatedPlaylists.uploads
				});
			}
			if(channelIds.slice(50).length > 0) {
				requestChannelDetails(channelIds.slice(50)).then(function(res) {
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
