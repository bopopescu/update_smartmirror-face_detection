
function Face_Regist($scope, $http, SpeechService, Focus) {

	var axios = require("axios");
	const MSCSFACEAPI = require("mscs-face-api");
	var Key = 'c91add23164c463b9ebd5c236c1c9ff8';
	var useServer = 'KOR';
	var mscsfa = new MSCSFACEAPI(Key,useServer);
	var personGroupId = 'pknusmartmirrorgroup';
	var userData = 'pknu smart mirror team';
	var confidenceThreshold = 0.4;
	var config2 = require("/home/pi/smart-mirror/config2.json");
	var exec = require('child_process').exec;
	console.debug('얼굴등록 컨트롤러 추가 완료');
	var filename ;
	var uName = "";
	var faceUrl ="";
    // 얼굴인식 커맨드 추가

	function findInPicture(){
		var removeImg = document.getElementById('picture');

		var contentDiv = document.getElementById('faceDetectionContent');

		while(contentDiv.firstChild){
				contentDiv.removeChild(contentDiv.firstChild);
		}



		var img = document.createElement('img');
		img.className = "picture";
		img.id = "picture";// 이미지 객체 생성
		var imageDiv = document.createElement('div');

		imageDiv.className = "picture-container";
        img.src = '/home/pi/smart-mirror/face_img/' + filename; // 이미지 경로 설정 (랜덤)
		imageDiv.appendChild(img);
		contentDiv.appendChild(imageDiv); // board DIV 에 이미지 동적 추가
		/*
		  $('.face').remove();

		  $('#picture').faceDetection({
			complete: function (faces) {
			  for (var i = 0; i < faces.length; i++) {
				$('<div>', {
				  'class':'face',
				  'css': {
					'position': 'absolute',
					'left':   faces[i].x * faces[i].scaleX + 'px',
					'top':    faces[i].y * faces[i].scaleY + 'px',
					'width':  faces[i].width  * faces[i].scaleX + 'px',
					'height': faces[i].height * faces[i].scaleY + 'px'
				  }
				})
				.insertAfter(this);
			  }
			},
			error:function (code, message) {
			  alert('Error: ' + message);
			}
		  });
	*/
	}//사진에서 얼굴찾기 함수 끝
	//얼굴인식 사용자 그룹 생성
	SpeechService.addCommand('create_face_group', function () {
			var personGroupId = 'pknusmartmirrorgroup';
			var name = "pknu_smartmirrorgroup"
			var userData = 'pknu smart mirror team';
			mscsfa.createPersonGroup(personGroupId, name, userData);
	});
	SpeechService.addCommand('delete_face_group', function () {
			var personGroupId = 'pknusmartmirrorgroup';
			mscsfa.deletePersonGroup(personGroupId);
	});
	SpeechService.addCommand('get_face_group', function () {
			console.log("사용자그룹 정보");
			console.log(mscsfa.getPersonGroup(personGroupId));
			console.log("사용자그룹내 인물 정보");
			console.log(mscsfa.listPersonsInPersonGroup(personGroupId,1,1000));

	});
	SpeechService.addCommand('face_regist', function () {

		$scope.face = "사용자를 등록하겠습니다 누구(으)로 해 줘 라고 말해주세요.";
		Focus.change("face_regist");
		if(responsiveVoice.voiceSupport()) {
          responsiveVoice.speak("사용자등록을 진행하겠습니다 이름을 이야기 해주세요.","Korean Female");
        }


		SpeechService.addCommand('user_name', function (userName) {
		var user = userName;
		uName = user;
		$scope.face = user+"님이 맞습니까? 맞아 거울아 혹은 아니야 거울아 로 대답해주세요.";
		if(responsiveVoice.voiceSupport()) {
          responsiveVoice.speak(user+"님이 맞습니까?","Korean Female");
        }
		userNameRegist();
		Focus.change("face_regist");
		});

		function userNameRegist(){

			SpeechService.addCommand('checkName', function (ans) {
					var an = ans;
					if(an == '맞아'){
						  $scope.face = "그럼 사진을 찍겠습니다.";
						 if(responsiveVoice.voiceSupport()) {
							responsiveVoice.speak("그럼 사진을 찍겠습니다.","Korean Female");
						 }
						camera();
						//temp_interval();
						setTimeout(interval, 2000);
					}else{
						  $scope.face = "아니라면 이름을 다시 누구(으)로 해줘 라고 말해주세요.";
						  if(responsiveVoice.voiceSupport()) {
						 			responsiveVoice.speak("죄송합니다 다시 이름을 이야기 해주세요.","Korean Female");
							 }
			}
			Focus.change("face_regist");
			});
		}
		//------------------------------------------------

		//------------------------------------------------
		var formatted ="";
		filename = "";
		function camera(){


			var datetime = require('node-datetime');
			var dt = datetime.create();
			 formatted = dt.format('YmdHMS');




			child = exec("fswebcam -r 1920x1080  --no-banner  /home/pi/smart-mirror/face_img/"+formatted+'face.jpg',
				function (error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				$scope.image = '/home/pi/smart-mirror/'+formatted+'face.jpg';
				setTimeout(interval,2000);
				if (error !== null) {
			 console.log('exec error: ' + error);
						  }
			});
			filename = formatted+'face.jpg';
			faceUrl = 'https://storage.googleapis.com/smartmirrortest/'+filename;

		}
		//--------------------------------임시테스트사진용함수--------------------------------------------
		function temp_interval(){
			const {Storage} = require('@google-cloud/storage');

			// Instantiates a client. If you don't specify credentials when constructing
			// the client, the client library will look for credentials in the
			// environment.
			const storage = new Storage({
				projectId: 'smart-mirror-239305',
				keyFilename: '/home/pi/smart-mirror/plugins/face_detection/gcs_keyfile.json'
			});
			// Makes an authenticated API request.
			var bucketName = "smartmirrortest";
			var filename = 'tes1.jpg';
			var fileUrl = "/home/pi/Downloads/"+filename;
			faceUrl = 'https://storage.googleapis.com/smartmirrortest/'+filename;
			storage.bucket(bucketName).upload(fileUrl, {
					// Support for HTTP requests made with `Accept-Encoding: gzip`
					gzip: true,
					// By setting the option `destination`, you can change the name of the
					// object you are uploading to a bucket.
					metadata: {
						// Enable long-lived HTTP caching headers
						// Use only if the contents of the file will never change
						// (If the contents will change, use cacheControl: 'no-cache')
						cacheControl: 'public, max-age=31536000',
					},

				});
				$scope.face = "얼굴등록 진행중";
				console.log("사진업로드 완료");
				$scope.faceUrl = faceUrl;
				console.log(faceUrl);
				setTimeout(faceCreatePersonInterval,1500);
		}

		//-----------------------------------------------------------------------------------------

		function interval(){

				// global.gcs = require('@google-cloud/storage')({
  			// 		projectId: 'mindful-ship-176106',
 				// 	keyFilename: '/home/pi/smart-mirror/plugins/face_detection/gcs_keyfile.json'
				// });
				//
				// var bucketName = 'smartmirrortest'
				//
				// // Reference an existing bucket.
				// var bucket = gcs.bucket(bucketName);
				const {Storage} = require('@google-cloud/storage');

				// Instantiates a client. If you don't specify credentials when constructing
				// the client, the client library will look for credentials in the
				// environment.
				const storage = new Storage({
				  projectId: 'smart-mirror-239305',
				  keyFilename: '/home/pi/smart-mirror/plugins/face_detection/gcs_keyfile.json'
				});
				// Makes an authenticated API request.
				var bucketName = "smartmirrortest"
				var filename = '/home/pi/smart-mirror/face_img/'+formatted+'face.jpg'
				// Upload a local file to a new file to be created in your bucket.
				storage.bucket(bucketName).upload(filename, {
				    // Support for HTTP requests made with `Accept-Encoding: gzip`
				    gzip: true,
				    // By setting the option `destination`, you can change the name of the
				    // object you are uploading to a bucket.
				    metadata: {
				      // Enable long-lived HTTP caching headers
				      // Use only if the contents of the file will never change
				      // (If the contents will change, use cacheControl: 'no-cache')
				      cacheControl: 'public, max-age=31536000',
				    },

				  });
					$scope.face = "얼굴등록 진행중";

					$scope.faceUrl = faceUrl;
					console.log(faceUrl);
					setTimeout(faceCreatePersonInterval,1500);
		}

		//face detection



	var userData = 'pknu smart mirror team';

	var personImage = faceUrl;

	mscsfa.trainPersonGroup(personGroupId);
	mscsfa.getPersonGroupTrainingStatus(personGroupId);
	mscsfa.getPersonGroup(personGroupId);

	function faceCreatePersonInterval(){
		console.log("사용자 등록중 createPerson");
	 mscsfa.createPerson(personGroupId, uName, userData).then(function () {

			setTimeout(function(){
				addPersonInterval()
				//console.log("사용자 등록 createPerson 완료");
			}, 2000);

		}).catch(function (err) {
                reject(err.response.data.error);
				console.log(res.data);
         });


	}


	//mscsfa.createPerson(personGroupId, name, userData);

	function addPersonInterval(){
		console.log(" addPersonInterval함수 실행");
		mscsfa.addPersonFace(personGroupId, global.pIdValue, userData, faceUrl).then(function () {

			setTimeout(function(){

				registComplete()
				console.log("이거 나타나면 registComplete정상동작");
			}, 2000);

		}).catch(function (err) {
                reject(err.response.data.error);
				console.log(res.data);
         });







	}
	function registComplete(){
		console.log("registComplete실행");
		if(global.addPerson = "c"){

			if(responsiveVoice.voiceSupport()) {
						responsiveVoice.speak("등록이 완료되었습니다.","Korean Female");
			}
				var text = '{"'+global.pIdValue+'":"'+uName+'"}';
				var obj = JSON.parse(text);
				var updater = require('jsonfile-updater');
				var fs = require('fs')
				function getParsedPackage() {
					 return JSON.parse(fs.readFileSync('/home/pi/smart-mirror/config2.json'))
				};
				console.log('수정');
				updater('/home/pi/smart-mirror/config2.json').append('faceDetection.personId', obj , function(err) {
					  if (err) return console.log(err)
					  var pkg = getParsedPackage()
					  console.log(pkg.author)
				});
			config2.faceDetection.personId[global.pIdValue] = uName ;
			trainFace();
		}else{
			if(responsiveVoice.voiceSupport()) {
						responsiveVoice.speak("사진 촬영중 오류가 발생하여 다시 사진을 찍겠습니다.","Korean Female");
			}
			camera();

			setTimeout(addPersonInterval, 2000);
		}
	}
	function trainFace(){
	mscsfa.trainPersonGroup(personGroupId);
		mscsfa.getPersonGroupTrainingStatus(personGroupId);
	}


	//컨피그 수정

});
}


angular.module('SmartMirror')
    .controller('Face_Regist', Face_Regist);
