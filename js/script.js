var img;
var imgh;
var img1;
var img2;
let video;
let poseNet;
let poses = [];
var city = "";
var state;
var country;
var coronaData;
var zones;
var size;
var districts = [];
var activeData = [];
var zoneData = [];
var stepSize;
var imgSize;
var listDist = [];
var listZone = [];

function setup() {
    var canvas = createCanvas(innerWidth, (innerWidth*3)/5);
    canvas.parent('sketch-div');

    img1 = loadImage('images/virus.png');

    $.get("https://api.covid19india.org/v2/state_district_wise.json", function(data) {
      coronaData = data;
    }, "json");

    $.get("https://api.covid19india.org/zones.json", function(data) {
      zones = data;
    }, "json");

    video = createCapture(VIDEO);
    video.size(width, height);

    poseNet = ml5.poseNet(video, modelReady);
    poseNet.on('pose', function(results) {
         poses = results;
    });

    video.hide();
    noStroke();
    textFont('Arvo');
    fill("#A42C2B");
}

function modelReady() {

  $.get("https://ipinfo.io?token=2600069d9abf4d", function(response) {
    city = response.city;
    state = response.region;
    country = response.country;
    console.log("City: "+city);
  }, "jsonp");

  if(country!="India" || city==""){
    city = "Kolkata";
    state = "West Bengal";
  }
  document.getElementById("distInput").setAttribute('value', city);

  for(i=0;i<coronaData.length;i++){
    for(j=0;j<coronaData[i].districtData.length;j++){
      districts.push(coronaData[i].districtData[j].district);
      districts.push(coronaData[i].districtData[j].district.toLowerCase());
      activeData.push(coronaData[i].districtData[j]);
      if(coronaData[i].districtData[j].district == city){
        listDist.push(coronaData[i].districtData[j]);
      }
    }
  }
  
  for(i=0;i<zones.zones.length;i++){
    var zoneObj = {district: zones.zones[i].district, zone: zones.zones[i].zone};
    zoneData.push(zoneObj);
  }

  for(i=0;i<zoneData.length;i++){
    if(zoneData[i].district == city){
      listZone.push(zoneData[i]);
      break;
    }
  }

  console.log('Model Loaded');
}

function draw(){

    background('#E9E9E9');
    if(video){
      video.loadPixels();
      stepSize = 12;

      for(var y=0; y<video.height; y+=stepSize){
        for(var x=0; x<video.width; x+=stepSize){
          var i = y * video.width + x;
          var darkness = (255 - video.pixels[i*4])/255;
          var size = stepSize * darkness;
          if(size<=17 && size>=5){
              image(img1, x, y, size, size);
          }
        }
      }
      fill('rgba(223,223,223, 0.30)');
      rect(0,0,innerWidth, (innerWidth*3)/5);
    }

    fill('rgba(223,223,223, 0.70)');
    rect(innerWidth/35,10,((innerWidth/3)-(innerWidth/52))*3, (innerWidth/23));
    textSize(innerWidth/40);
    textAlign(CENTER);
    textStyle(BOLD);
    fill("#A42C2B");
    text('Wear a mask to protect yourself !', innerWidth/2, innerWidth/38);
    textSize(innerWidth/74);
    textAlign(CENTER);
    textStyle(NORMAL);
    fill('rgb(99,99,99)');
    text('(Wear the mask and see the magic of virus cluster moving away from your face.)', innerWidth/2, innerWidth/22);

    if(poses.length == 0){
    }
    else{
        imgSize = innerWidth/4;
        let poseKeypointX = poses[0].pose.keypoints[0].position.x-(imgSize/2);
        let poseKeypointY = poses[0].pose.keypoints[0].position.y-(imgSize/2);
        var colorArray = [
          "#E14345",
          "#A32729",
          "#828180"
        ];
        if (poses[0].pose.keypoints[0].score > 0.8){
          for(i=0;i<50;i++){
            let xRandom = random((poseKeypointX),(poseKeypointX+imgSize));
            let yRandom = random((poseKeypointY),(poseKeypointY+imgSize));
            let sizeRandom = random(15,20);
            var randomColor = colorArray[Math.floor(Math.random()*3)];
            fill(randomColor);
            image(img1, xRandom, yRandom, sizeRandom, sizeRandom);
          }
        }
        else{
          for(i=0;i<100;i++){
            let xRandom = random(0,innerWidth);
            let yRandom = random(0,innerHeight);
            if((((poseKeypointX+imgSize-30) < xRandom) || (xRandom < poseKeypointX+30)) || (((poseKeypointY+imgSize-30) < yRandom) || (yRandom < poseKeypointY+30))){
              let sizeRandom = random(15,25);
              var randomColor = colorArray[Math.floor(Math.random()*3)];
              fill(randomColor);
              image(img1, xRandom, yRandom, sizeRandom, sizeRandom);
            }
          }
        }
    }

    var gridWidth = (innerWidth/4);
    var gridHeight = gridWidth;
    var x= 0;
    var y= 0;
    var countD = 0;
    for(i=0;i<8;i++){
      if(i==4){
        y=y+(gridHeight/1.2);
        x=0;
      }
      if(i!=5){
        if(listDist[countD]){
          if(!listZone[countD]){
            stroke('rgba(223,223,223)');
            strokeWeight(8);
          }
          else{
            for(k=0;k<listZone.length;k++){
              if(listDist[countD].district == listZone[k].district){
                if(listZone[k].zone == "Green"){
                  stroke('rgba(119,221,119, 0.55)');
                  strokeWeight(8);
                  break;
                }
                else if(listZone[k].zone == "Orange"){
                  stroke('rgba(225,151,26, 0.50)');
                  strokeWeight(8);
                  break;
                }
                else if(listZone[k].zone == "Red"){
                  stroke('rgba(225,67,69, 0.45)');
                  strokeWeight(8);
                  break;
                }
              }
            }
          }
          fill('rgba(223,223,223, 0.70)');
          rect(x+(innerWidth/35),y+(gridHeight/3.5),gridWidth-(innerWidth/18),gridHeight/1.5,10);
          noStroke();
          textSize(innerWidth/75);
          textAlign(LEFT);
          textStyle(NORMAL);
          fill("#A42C2B");
          text('District: '+listDist[countD].district, x+(innerWidth/25), y+(gridHeight/4)+(innerWidth/28));
          text('Active Cases: '+listDist[countD].active, x+(innerWidth/25), y+(gridHeight/4)+((innerWidth/31)*2));
          text('Deceased: '+listDist[countD].deceased, x+(innerWidth/25), y+(gridHeight/4)+((innerWidth/32)*3));
          text('Recovered: '+listDist[countD].recovered, x+(innerWidth/25), y+(gridHeight/4)+((innerWidth/32)*4));
          text('Total Cases: '+listDist[countD].confirmed, x+(innerWidth/25), y+(gridHeight/4)+((innerWidth/32)*5));
          countD++;
        }
        else{
          break;
        }
      }
      x=x+gridWidth;
      if(i==5){
        x=x+gridWidth;
      }
    }

    sleep(250);
}

function capitalize_Words(str)
{
 return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

$(function() {

  $("#distInput").tags({
    unique: true,
    maxTags: 5,
    requireData: true
  }).autofill({
    data: districts
  });

  $("#distInput").on("tagRemove",function(e,tag){

    nTag = capitalize_Words(tag);

    for(i=0;i<listDist.length;i++){
      if(listDist[i].district == nTag){
        listDist.splice(i, 1);
        i=i-2;
      }
    }

    for(i=0;i<listZone.length;i++){
      if(listZone[i].district == nTag){
        listZone.splice(i, 1);
        break;
      }
    }

  });
  
  $("#distInput").on("tagAdd",function(e,tag){

    nTag = capitalize_Words(tag);

    for(i=0;i<coronaData.length;i++){
      for(j=0;j<coronaData[i].districtData.length;j++){
        if(coronaData[i].districtData[j].district == nTag){
          listDist.push(coronaData[i].districtData[j]);
          break;
        }
      }
    }

    for(i=0;i<zoneData.length;i++){
      if(zoneData[i].district == nTag){
        listZone.push(zoneData[i]);
        break;
      }
    }
  });

});

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}


