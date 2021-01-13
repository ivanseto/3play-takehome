// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

import Rails from "@rails/ujs"
import Turbolinks from "turbolinks"
import * as ActiveStorage from "@rails/activestorage"
import "channels"

Rails.start()
Turbolinks.start()
ActiveStorage.start()

window.onload=function(){
  	const searchButton = document.getElementById('search-btn')  		
  	searchButton.addEventListener('click', searchMovies)
  	const submitButton = document.getElementById('submit-btn')
  	submitButton.addEventListener('click', submit)
  	const replayButton = document.getElementById('replay-btn')
  	replayButton.addEventListener('click', replay)
  	var movieResults = null
  	var selectedActors = new Array()
  	var actorHash = {}
  	var points = 0

	function resetGame() {
		movieResults = null
  		selectedActors = new Array()
  		actorHash = {}
  		points = 0
  		$("#moviesList").html('');
  		$("#actorsList").html('');
  		$("#scoreText").html('');
  		$("#gameText").html('');
		replayButton.classList.add('hidden')
		$('.form-group')[0].classList.remove('hidden')
	}

	function searchMovies() {
		resetGame()
		submitButton.classList.add('hidden')
		$.ajax({
            url: "https://api.themoviedb.org/3/search/movie?language=en-US&query=" + $("#searchInput").val(),
            data: { "api_key": "3356865d41894a2fa9bfa84b2b5f59bb" },
            dataType: "json",
			success: function (result) {
				var resultHtml = $("<div class=\"resultDiv\" id=\"movie-results\">");
                for (var i = 0; i < result["results"].length; i++) {
                    var image = result["results"][i]["poster_path"] == null ? "https://upload.wikimedia.org/wikipedia/en/6/60/No_Picture.jpg" : "https://image.tmdb.org/t/p/w500/" + result["results"][i]["poster_path"];  
                    resultHtml.append("<div class=\"result\" resourceId=\"" + result["results"][i]["id"] + "\">" + "<input type=\"image\" id=\"" + result["results"][i]["id"] + "\" src=\"" + image + "\" />" + "<p>" + result["results"][i]["original_title"] + "</p></div>")
                }
                resultHtml.append("</div>");

                $("#moviesList").html(resultHtml);
                movieResults = document.getElementById('movie-results')

                for (var i = 0; i < result["results"].length; i++) {
                	let movie_id = result["results"][i]["id"]
                	let movie_name = result["results"][i]["original_title"]
                    const imageButton = document.getElementById(movie_id)
                    imageButton.addEventListener('click', function() {selectMovie(movie_id, movie_name)}) 
                }
			},
			error: function () {
				console.log('error')
			}
		})		
	}

	function selectMovie(movie_id, movie_name) {
		let namesArray = []
		let selected = []
		movieResults.classList.add("hidden")
		let resultHtml = $("<div class=\"actorDiv\" id=\"actor-results\">");
		var actorArray = new Array()
		submitButton.classList.remove('hidden')
		$('.form-group')[0].classList.add('hidden')

		$.ajax({
			url: "https://api.themoviedb.org/3/movie/" + movie_id + "/credits?",
			data: { "api_key": "3356865d41894a2fa9bfa84b2b5f59bb" },
			dataType: "json",
			success: function (result) {
				let shuffled = result["cast"].sort(() => 0.5 - Math.random())
				selected = shuffled.slice(0, 3);
				
                for (var i = 0; i < selected.length; i++) {
                    var image = selected[i]["profile_path"] == null ? "https://www.kindpng.com/picc/m/22-223965_no-profile-picture-icon-circle-member-icon-png.png" : "https://image.tmdb.org/t/p/w500/" + selected[i]["profile_path"];  
                    actorArray.push("<div class=\"actor-result\"" + "\">" + "<input type=\"image\" actor-id=\"" + selected[i]["id"] + "\" src=\"" + image + "\" />" + "<p>" + selected[i]["name"] + "</p></div>")
                	actorHash[selected[i]["id"]] = true
                }
			},

			error: function() {
				console.log('error')
			}
		})

		let randomPage = Math.floor(Math.random() * Math.floor(500))
		$.ajax({
			url: "https://api.themoviedb.org/3/person/popular?&language=en-US",
            data: { "api_key": "3356865d41894a2fa9bfa84b2b5f59bb",
            		"page": randomPage },
            dataType: "json",
			success: function (result) {
				const selected = result["results"].sort(() => 0.5 - Math.random())
                for (var i = 0; i < selected.length; i++) {
            		if (actorHash[selected[i]["id"]] == undefined) {
            			var image = selected[i]["profile_path"] == null ? "https://www.kindpng.com/picc/m/22-223965_no-profile-picture-icon-circle-member-icon-png.png" : "https://image.tmdb.org/t/p/w500/" + selected[i]["profile_path"];  
                		actorArray.push("<div class=\"actor-result\"" + "\">" + "<input type=\"image\" actor-id=\"" + selected[i]["id"] + "\" src=\"" + image + "\" />" + "<p>" + selected[i]["name"] + "</p></div>")
            			actorHash[selected[i]["id"]] = false
                	}
                	if (actorArray.length == 5) {
                		break
                	}
                }
                const shuffled = actorArray.sort(() => 0.5 - Math.random())
                for (var i = 0; i < shuffled.length; i++) {
					resultHtml.append(shuffled[i])
				}
				resultHtml.append("</div>");
				$("#actorsList").html(resultHtml);

				let instructions = $("<div id=\"instructions\">Select the 3 actors who are in the movie " + movie_name + "</div>");
				$("#gameText").html(instructions)


				for (let id in actorHash) {
					let actorImg = $('[actor-id="' + id + '"]')[0]
					actorImg.addEventListener('click', function() {toggleActor(id)}) 
				}
			},
			error: function() {
				console.log('error')
			}
		})
	}

	function toggleActor(id) {
		let actorImg = $('[actor-id="' + id + '"]')[0]
		if (actorImg.classList.contains('selected')) {
			actorImg.classList.remove("selected")
			var index = selectedActors.indexOf(id);
			if (index !== -1) {
  				selectedActors.splice(index, 1);
			}
		} else {
			actorImg.classList.add("selected")
			selectedActors.push(id)
		}
		if (selectedActors.length == 3) {
			submitButton.classList.remove('disabled')
		} else {
			submitButton.classList.add('disabled')
		}
	}

	function submit() {
		selectedActors.forEach(function(id) {
			let actorImg = $('[actor-id="' + id + '"]')[0]
			if (actorHash[id]) {
				points++	
				actorImg.classList.add('correct')
			} else {
				actorImg.classList.add('incorrect')
			}
			actorImg.disabled = true
		})
		if (points == 1) {
			var text = "1 point!"
		} else {
			var text = points + " points!"
		}
		var pointsText = $("<div id=\"score\"><p>You got " + text + "</p></div>")
		$("#scoreText").html(pointsText)
		submitButton.classList.add('disabled')
		submitButton.classList.add('hidden')
		replayButton.classList.remove('hidden')
	}

	function replay() {
		document.getElementById('searchInput').value = ''
		resetGame()
	}

}