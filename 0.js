var selectedElement=null;

const flag=document.documentElement.classList;

Response.prototype.document=function() {
	return this.text().then(function(txt) {
		const doc=new DOMParser().parseFromString(txt, "text/html"),
					base=doc.createElement("base");
		base.href=this.url;
		doc.head.appendChild(base);
		return doc;
	});
};

function asTime(x) {
	x/=1000;
	return (x>=3600?~~(x / 3600)+":":"")+('0' + ~~((x / 60) % 60)).slice(-2)+":"+('0' + ~~(x % 60)).slice(-2);
}

function start() {
	console.log("start");
	
	//tizen.tvinputdevice.registerKeyBatch(['Exit']);
	
	document.body.addEventListener('keydown', function(e) {
		if (selectedElement!==null) selectedElement.onKey.call(selectedElement,e.keyCode);
		if (e.keyCode!==123) //2do F12
			e.preventDefault();
	});
	
	spinner.onKey=function(keyCode) {
		//if (keyCode===tizen.tvinputdevice.getKey('Exit').code) exitApp();
		if (keyCode===10182 || keyCode===35) exitApp();
	};
	create_main();	
	start_main();    
}

function exitApp() {
	try {
		tizen.application.getCurrentApplication().exit();
	} catch (e) {
		console.error('Application exit failed.', e);
	}
}

function create_main() {
	const main=document.createElement("div"),
				dialog=document.createElement("div"),
				error=document.createElement("div"),
				player=document.createElement("div");
	main.innerHTML=
		'<div id="cover"></div>'+
		'<div id="bg1" class="bg-image"></div><div id="bg2" class="bg-image"></div>'+
		'<div id="title"></div><div id="genre"></div><div id="description"></div>'+
		'<div id="carousel"></div>'+
		'<div id="sContainer"><div id="seasons"></div></div>'+
		'<div id="eContainer"><div id="episodes"></div></div>';
	dialog.innerHTML='<div id="strmContainer"><div id="streams"></div></div>';
	error.innerHTML='<div id="errorMsg"></div>';
	player.innerHTML=
		'<object type="application/avplayer" id="video"></object>'+
		'<div id="bar">'+
			'<div id="barTrack">'+
				'<progress id="barPlay" value="0" max="100"></progress>'+
				'<progress id="barLoad" value="0" max="100"></progress>'+
			'</div>'+
			'<div id="currenttime">0:00</div>'+
			'<div id="duration">0:00</div>'+
		'</div>';
  main.id="main";
  dialog.id="dialog";
  error.id="error";
  player.id="player";
  document.body.appendChild(main);
  document.body.appendChild(dialog);
  document.body.appendChild(player);
  document.body.appendChild(error);
  
  error.keyBack=function() {};
  error.onKey=function(keyCode) {
		switch (keyCode) {
			//case tizen.tvinputdevice.getKey('Back').code: // 2do evtl. andere Taste
			case 10009:
			case 27:
			//case tizen.tvinputdevice.getKey('Enter').code:
			case 13:
				flag.remove("error");
				this.keyBack();
				break;
			//case tizen.tvinputdevice.getKey('Exit').code:
			case 10182:
			case 35:
				exitApp();
				break;
		}
	};
	
	player.bar=function() {
		flag.remove("bar");
		if (player.timeout) clearTimeout(player.timeout);
		if (player.playing) player.timeout=setTimeout(function () {flag.add("bar");},3000);
	};
	player.play=function() {
		webapis.avplay.play();
		player.playing=true;
		player.bar();		
	};
	player.close=function() {
		webapis.avplay.close();
		player.style.display="none";
		flag.remove("stream-menu","error","bar","waiting");
		selectedElement=episodes.querySelector(".selected");
	};
	player.onKey=function(keyCode) {
		player.bar();
		switch(keyCode) {
			//case tizen.tvinputdevice.getKey('Back').code:
			case 10009:
			case 27: //Esc
			//case tizen.tvinputdevice.getKey('MediaStop').code:
			case 413:
			case 66: //b
				webapis.avplay.stop();
				player.close();
				break;
			//case tizen.tvinputdevice.getKey('MediaPlay').code:
			case 415:
			case 67: //c
				player.play();
				break;
			//case tizen.tvinputdevice.getKey('MediaPause').code:
			case 19:
			case 86: //v
				//player.pause();
				webapis.avplay.pause();
				player.playing=false;
				player.bar();
				break;
			//case tizen.tvinputdevice.getKey('MediaRewind').code:
			case 412:
			case 88: //x
				console.log("MediaRewind");
				webapis.avplay.jumpBackward(15000); // 2do: test jump bei pause!!!
				break;
			//case tizen.tvinputdevice.getKey('MediaFastForward').code:
			case 417:
			case 78: //n
				console.log("MediaFastForward");
				webapis.avplay.jumpForward(15000);
				break;
			//case tizen.tvinputdevice.getKey('MediaTrackPrevious').code:
			case 10232:
			case 89: //y
				console.log("MediaTrackPrevious");
				webapis.avplay.jumpBackward(30000);
				break;
			//case tizen.tvinputdevice.getKey('MediaTrackNext').code:
			case 10233:
			case 77: //m
				console.log("MediaTrackNext");
				webapis.avplay.jumpForward(30000);
				break;	
			//case tizen.tvinputdevice.getKey('Exit').code:
			case 10182:
			case 35:
				webapis.avplay.stop();
				player.close();
				exitApp();
				break;	
		}
	};
  
}

function start_main() {	
	showSpinner();
	fetch('https://raw.githubusercontent.com/qwertz3/xyz/main/'+'data.json')
  .then(function(response) { return response.json(); })
  .then(function(json) {
  	//console.log(json);
  	if (json.items.length>0) {
			carousel.innerHTML="";
			json.items.forEach(function(item,i) {
				item.obj=document.createElement("div");
				item.obj.className="item";
				//item.obj.setAttribute("id",item.id);
				item.obj.innerHTML='<div class="item-card" style="background-image: url(\'http://186.2.175.5/public/img/cover/'+item.cover+'\')">';
				item.obj.onKey=function(keyCode) {
					//console.log(i);
					switch (keyCode) {
						//case tizen.tvinputdevice.getKey('ArrowRight').code:
						case 39:
							if (i<json.items.length-1) json.items[i+1].select();
							break;
						//case tizen.tvinputdevice.getKey('ArrowLeft').code:
						case 37:
							if (i>0) json.items[i-1].select();
							break;					
						//case tizen.tvinputdevice.getKey('Enter').code:
						case 13:
							item.enter();
							break;
						//case tizen.tvinputdevice.getKey('Back').code: // 2do evtl. andere Taste
						case 10009:
						case 27:
							console.log("back");
							start_main();
							break;
						//case tizen.tvinputdevice.getKey('Exit').code:
						case 10182:
						case 35:
							exitApp();
							break;
					}
				};
				item.select=function() {
					if (selectedElement!==item.obj) {
						if (selectedElement) selectedElement.classList.remove("selected");
						item.obj.classList.add("selected");
						selectedElement=item.obj;
						title.innerHTML=item.name;
						genre.innerHTML=item.genre;
						description.innerHTML=item.description;
						if (bg1.x=!bg1.x) {
							bg1.style.backgroundImage="url('http://186.2.175.5/public/img/cover/"+item.background+"')";
							bg1.style.opacity=1;
							bg2.style.opacity=0;
						} else {
							bg2.style.backgroundImage="url('http://186.2.175.5/public/img/cover/"+item.background+"')";
							bg2.style.opacity=1;
							bg1.style.opacity=0;
						}
						item.scrollen();
					}
				};
				item.scrollen=function() {
					carousel.scrollLeft=Math.min(item.obj.offsetLeft-item.obj.offsetWidth,Math.max(item.obj.offsetLeft-carousel.offsetWidth+2*item.obj.offsetWidth,carousel.scrollLeft));
				};
				item.enter=function() {
					cover.style.backgroundImage="url('http://186.2.175.5/public/img/cover/"+item.cover+"')";
					flag.add("serial");
					getSeasons('http://186.2.175.5/serie/stream/'+item.id,item.d||0);
				};
				carousel.appendChild(item.obj);
			});
			json.items[0].select();
		} else {
			//2do
		}
		flag.remove("waiting");
  })
  .catch(function(e) { console.log(e); }); //2do
}

function getSeasons(url,d) {
	showSpinner();
	seasons.innerHTML="";
	episodes.innerHTML="";
	fetch(url)
	.then(function(x) { return x.document(); })
	.then(function(doc) {
		const eps=doc.querySelectorAll(".seasonEpisodeTitle a");
		if (eps) {
			eps.forEach(function(ep,i) {
				ep.obj=document.createElement("div");
				ep.obj.innerHTML=ep.firstElementChild.textContent;
				if (d>0) {
					const m=ep.lastElementChild.textContent.match(/\d+/);
					ep.obj.setAttribute("n",m?m[0]:'?');
				} else ep.obj.setAttribute("n",i+1);
				ep.obj.className="episode";
				ep.obj.onKey=function(keyCode) {
					switch (keyCode) {
						//case tizen.tvinputdevice.getKey('ArrowLeft').code:
						case 37:
							selectedElement.classList.remove("selected");
							const dy=seasons.scrollTop+selectedElement.offsetTop-episodes.scrollTop;
					    let k=0;
					    for (var x, z, z0=Infinity; x=seasons.children[k]; k++) {
					        z=Math.abs(x.offsetTop-dy);
					        if (z<z0) z0=z;
					            else break;
					    }
							selectedElement=seasons.children[k-1];
							selectedElement.classList.add("selected");
							break;
						//case tizen.tvinputdevice.getKey('ArrowDown').code:
						case 40:
							if (i<eps.length-1) eps[i+1].obj.select();
							break;
						//case tizen.tvinputdevice.getKey('ArrowUp').code:
						case 38:
							if (i>0) eps[i-1].obj.select();
							break;					
						//case tizen.tvinputdevice.getKey('Enter').code:
						case 13:
							openEpisode('http://186.2.175.5'+ep.getAttribute("href"));
							break;
						//case tizen.tvinputdevice.getKey('Back').code:
						case 10009:
						case 27:
							selectedElement=carousel.querySelector(".selected");
							flag.remove("serial");
							break;
						//case tizen.tvinputdevice.getKey('Exit').code:
						case 10182:
						case 35:
							exitApp();
							break;
					}					
				};
				ep.obj.select=function() {
					selectedElement.classList.remove("selected");
					selectedElement=this;
					this.classList.add("selected");
					this.scrollen();
				};
				ep.obj.scrollen=function() {
					episodes.scrollTop=Math.min(this.offsetTop-this.offsetHeight,Math.max(this.offsetTop-episodes.offsetHeight+2*this.offsetHeight,episodes.scrollTop));
				};				
				episodes.appendChild(ep.obj);
			});
			//2do:
			//let sns=doc.querySelector("#stream li a.active")?.parentElement?.parentElement?.querySelectorAll("a");
			let sns=doc.querySelector("#stream li a.active").parentElement.parentElement.querySelectorAll("a");
			if (sns) {
				//if (d>0) sns=[...sns].reverse(); //2do
				sns.forEach(function(sn,i) {
					sn.obj=document.createElement("div");
					if (d>0) sn.obj.innerHTML=(parseInt(sn.textContent)+d).toString();
						else sn.obj.innerHTML="Staffel "+sn.textContent;
					sn.obj.className="season";
					sn.obj.onKey=function(keyCode) {
						switch (keyCode) {
							//case tizen.tvinputdevice.getKey('ArrowRight').code:
							case 39:
								selectedElement.classList.remove("selected");
								const dy=episodes.scrollTop+selectedElement.offsetTop-seasons.scrollTop;
						    let k=0;
						    for (var x, z, z0=Infinity; x=episodes.children[k]; k++) {
						        z=Math.abs(x.offsetTop-dy);
						        if (z<z0) z0=z;
						            else break;
						    }
						    selectedElement=episodes.children[k-1];
								selectedElement.classList.add("selected");
								break;
							//case tizen.tvinputdevice.getKey('ArrowDown').code:
							case 40:
								if (i<sns.length-1) sns[i+1].obj.select();
								break;
							//case tizen.tvinputdevice.getKey('ArrowUp').code:
							case 38:
								if (i>0) sns[i-1].obj.select();
								break;					
							//case tizen.tvinputdevice.getKey('Enter').code:
							case 13:
								getSeasons(sn.href,d);
								break;
							//case tizen.tvinputdevice.getKey('Back').code:
							case 10009:
							case 27:
								selectedElement=carousel.querySelector(".selected");
								flag.remove("serial");
								break;
							//case tizen.tvinputdevice.getKey('Exit').code:
							case 10182:
							case 35:
								exitApp();
								break;
						}
					};
					sn.obj.select=function() {
						selectedElement.classList.remove("selected");
						selectedElement=this;
						this.classList.add("selected");
						this.scrollen();
					};
					sn.obj.scrollen=function() {
						seasons.scrollTop=Math.min(this.offsetTop-this.offsetHeight,Math.max(this.offsetTop-seasons.offsetHeight+2*this.offsetHeight,seasons.scrollTop));
					};
					if (sn.classList.contains("active")) {
						sn.obj.classList.add("active");
						seasons.selected=sn.obj;
					}
					seasons.appendChild(sn.obj);
				});
			}
			eps[0].obj.select();
			seasons.selected.scrollen();
		} else {
			// 2do
		}
		flag.remove("waiting");	
	})
	.catch(function(e) { console.log(e); }); // 2do
}

function openEpisode(url) {
	showSpinner();
	fetch(url)
	.then(function(x) { return x.document(); })
	.then(function(doc) {
		const strms=[].map.call(doc.querySelectorAll(".watchEpisode"),function (strm) {
			const h4=strm.getElementsByTagName("h4");
			return {hoster:h4?h4[0].textContent:'',href:'http://186.2.175.5'+strm.getAttribute('href')}; 
		});
		if (strms) {
			streams.innerHTML="";
			strms.forEach(function(strm,i) {					
				strm.obj=document.createElement("div");
				strm.obj.innerHTML=strm.hoster;
				strm.obj.className="stream";				
				strm.obj.onKey=function(keyCode) {
					switch (keyCode) {
						//case tizen.tvinputdevice.getKey('ArrowDown').code:
						case 40:
							if (i<strms.length-1) strms[i+1].obj.select();
							break;
						//case tizen.tvinputdevice.getKey('ArrowUp').code:
						case 38:
							if (i>0) strms[i-1].obj.select();
							break;					
						//case tizen.tvinputdevice.getKey('Enter').code:
						case 13:
							switch (strm.hoster.toLowerCase()) {
								case 'voe':
									voe(strm.href);
									break;
								case 'streamtape':
									streamtape(strm.href);
									break;
								default:
									err("Hoster kann nicht abgespielt werden!",function() {
										selectedElement=streams.querySelector(".selected");
									});
							}
							break;
						//case tizen.tvinputdevice.getKey('ArrowLeft').code:
						case 37:
						//case tizen.tvinputdevice.getKey('Back').code:
						case 10009:
						case 27:
							selectedElement.classList.remove("selected");
							selectedElement=episodes.querySelector(".selected");
							flag.remove("stream-menu");
							break;
						//case tizen.tvinputdevice.getKey('Exit').code:
						case 10182:
						case 35:
							exitApp();
							break;
					}					
				};
				strm.obj.select=function() {
					selectedElement.classList.remove("selected");
					selectedElement=this;
					this.classList.add("selected");
					this.scrollen();
				};
				strm.obj.scrollen=function() {
					streams.scrollTop=Math.min(this.offsetTop-this.offsetHeight,Math.max(this.offsetTop-streams.offsetHeight+2*this.offsetHeight,streams.scrollTop));
				};				
				streams.appendChild(strm.obj);
			});
			strms[0].obj.select();
			flag.remove("waiting");
			flag.add("stream-menu");
		} else {
			err("Keine Streams gefunden!",function() {
				selectedElement=episodes.querySelector(".selected");
				flag.remove("stream-menu");				
			});
		}
		
	})
	.catch(function(e) {
		err("Fehler beim Laden der Streams!",function() {
			selectedElement=episodes.querySelector(".selected");
			flag.remove("stream-menu");				
		});
		console.log(e);
	});
}1

function streamtape(url) {
	fetch(url)
	.then(function(x) { return x.document(); })
	.then(function(doc) {
		const r=/ById\('.+?=\s*(["']\/\/[^;<]+)/g;
		let m=[].find.call(doc.querySelectorAll("script:not(:empty)"),function(x) { return r.test(x.textContent);});
		if (m) {
			m=m.textContent.match(r);
			if (m) {
				m=m[m.length-1].match(new RegExp(r,''));
				if (m) {
					let u=m[1].split("+").map(function(part) {
						const m1=part.match(/["']([^'"]+)/);
						if (m1) {
							const m2=part.match(/substring\(\d+/g);
							if (m2) return m1[1].substring(m2.reduce(function(a,b) { return a+parseInt(b.substring(10)); },0));
								else return m1[1]; 
						} else return "";
					}).join("");
					if (u.indexOf("//")===0) {
						//m=doc.baseURI.match(/^https?:/);
						//if (m) u=m[0]+u;
							//else 
						u='https:'+u;
					} //else if (!/^https?:\/\/./.test(u)) //2do Fehler
					play(u+"&stream=1");
				} else {
					// 2do
				}
			} else {
				// 2do
			}
		} //else //2do
	})
	.catch(function(e) { console.log(e); }); // 2do
}			

function voe(url) { // 2do
/*	
  	fetch(url)
	.then(function(x) { return x.document(); })
	.then(function(doc) {
		const u=(x=>atob(x.match(/hls["']?\s*:\s*["']([^"']+)/)?.[1]||"")||x.match(/["'](https?:\/\/.+?)["']/i)?.[1])([].find.call(doc.querySelectorAll("script:not(:empty)"),x=>/sources\s*=\s*{([\s\S]*?)}/.test(x.textContent))?.textContent.match(/sources\s*=\s*{([\s\S]*?)}/i)?.[1]);
		if (typeof u==='string' && /^https?:\/\/./.test(u)) play(u);
			// else 2do
	})
	.catch(function(e) { console.log(e); }); // 2do
*/
}

// 2do doodstrem
// 2do v...

function play(url) {
	webapis.avplay.open(url);
	webapis.avplay.setListener({
		onbufferingstart: function() {
			console.log("waiting");
			flag.add("waiting"); // 2do: test waiting
		},
		onbufferingprogress:function(b) {
			console.log("buffer",b);
			barLoad.value=b;
		},
		onbufferingcomplete: function() {
			console.log("canplay");
			flag.remove("waiting");
		},
		onstreamcompleted: function() {
			webapis.avplay.stop();
			console.log("Stream beendet");
			//err("Beendet"); //2do
	  },
	  onerror:function(e) {
	  	webapis.avplay.stop();
			console.error(e);
			err("Fehler beim Abspielen:\n"+e,player.close);
	  },  
		oncurrentplaytime: function(currentTime) {
		  console.log("Current playtime: " + currentTime);
		  currenttime.innerHTML=asTime(currentTime);
		  barPlay.value=currentTime/webapis.avplay.getDuration(); //2do funktioniert nicht!
		}
	});
	webapis.avplay.setDisplayRect(0,0,1920,1080);
	player.style.display="block";
	selectedElement=player;
	webapis.avplay.prepareAsync(function() {
		duration.innerHTML=asTime(webapis.avplay.getDuration());
		player.play();
	},function(e) {
		webapis.avplay.stop();
		console.error(e);
		err("Fehler beim Abspielen:\n"+e,player.close); // 2do: test error
	});
}

function showSpinner() {
	flag.add("waiting");
	selectedElement=spinner;
}

function err(e,backFunc) {
	flag.remove("waiting");
	console.log(e);
	errorMsg.innerHTML=e;
	error.keyBack=backFunc;
	selectedElement=error;
	flag.add("error");
}
