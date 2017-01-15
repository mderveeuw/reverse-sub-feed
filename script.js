function handleClientLoad() {
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

function updateSigninStatus(isSignedIn) {
	if (isSignedIn) {
		makeApiCall();
	}
}

function handleAuthClick(event) {
	gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
	gapi.auth2.getAuthInstance().signOut();
}

function makeApiCall() {
	
}
