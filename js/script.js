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
    var canvas = createCanvas(innerWidth, innerHeight);
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
          // tint(255, 127);
          if(size<=17 && size>=5){
              image(img1, x, y, size, size);
          }
        }
      }
      fill('rgba(223,223,223, 0.49)');
      rect(0,0,innerWidth, innerHeight);
    }

    fill('rgba(223,223,223, 0.70)');
    // rect(innerWidth/4.9,10,innerWidth/1.7, (innerWidth/23));
    rect(innerWidth/35,10,((innerWidth/3)-(innerWidth/52))*3, (innerWidth/23));
    textSize(innerWidth/40);
    textAlign(CENTER);
    textStyle(BOLD);
    fill("#A42C2B");
    text('Wear a mask to protect yourself !', innerWidth/2, innerWidth/38);
    textSize(innerWidth/74);
    textAlign(CENTER);
    textStyle(NORMAL);
    fill(0);
    text('(Wear the Mask and see the magic of virus cluster moving away from your face.)', innerWidth/2, innerWidth/22);

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
            let sizeRandom = random(5,15);
            var randomColor = colorArray[Math.floor(Math.random()*3)];
            fill(randomColor);
            circle(xRandom, yRandom, sizeRandom);
            // image(img, xRandom, yRandom, sizeRandom, sizeRandom);
          }
          //image(img, poseKeypointX, poseKeypointY, imgSize, imgSize);
        }
        else{
          for(i=0;i<100;i++){
            let xRandom = random(0,innerWidth);
            let yRandom = random(0,innerHeight);
            if((((poseKeypointX+imgSize-30) < xRandom) || (xRandom < poseKeypointX+30)) || (((poseKeypointY+imgSize-30) < yRandom) || (yRandom < poseKeypointY+30))){
              let sizeRandom = random(5,15);
              var randomColor = colorArray[Math.floor(Math.random()*3)];
              fill(randomColor);
              circle(xRandom, yRandom, sizeRandom);
            }
          }
          //image(imgh, poseKeypointX, poseKeypointY, imgSize*1.1, imgSize*1.1);
        }
    }

    var gridWidth = innerWidth/3;
    var gridHeight = innerHeight/2;
    var elementSize = gridWidth;
    var x= 0;
    var y= 0;
    var countD = 0;
    for(i=0;i<6;i++){
      if(i==3){
        y=y+(gridHeight/1.2);
        x=0;
      }
      if(i!=4){
        if(listDist[countD]){
          // fill('rgba(164,44,43, 0.7)');
          if(listZone[countD].zone == "Green" && listZone){
            fill('rgba(119,221,119, 0.55)');
          }
          else if(listZone[countD].zone == "Orange" && listZone){
            fill('rgba(225,151,26, 0.50)');
          }
          else if(listZone[countD].zone == "Red" && listZone){
            fill('rgba(225,67,69, 0.45)');
          }else{
            fill('rgba(223,223,223, 0.70)');
          }
          rect(x+(innerWidth/35),y+(gridHeight/4),gridWidth-(innerWidth/18),gridHeight/1.5,10);
          textSize(innerWidth/50);
          textAlign(LEFT);
          textStyle(BOLD);
          fill("#A42C2B");
          text('District: '+listDist[countD].district, x+(innerWidth/24), y+(gridHeight/4)+(innerWidth/35));
          text('Active Case: '+listDist[countD].active, x+(innerWidth/24), y+(gridHeight/4)+((innerWidth/34)*2));
          text('Deceased: '+listDist[countD].deceased, x+(innerWidth/24), y+(gridHeight/4)+((innerWidth/34)*3));
          text('Recovered: '+listDist[countD].recovered, x+(innerWidth/24), y+(gridHeight/4)+((innerWidth/34)*4));
          text('Total Case: '+listDist[countD].confirmed, x+(innerWidth/24), y+(gridHeight/4)+((innerWidth/34)*5));
          countD++;
        }
        else{
          break;
        }
      }
      x=x+gridWidth;
    }

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

    for(i=0;i<listDist.length;i++){
      if(listDist[i].district == tag){
        listDist.splice(i, 1);
        break;
      }
    }

    for(i=0;i<listZone.length;i++){
      if(listZone[i].district == tag){
        listZone.splice(i, 1);
        break;
      }
    }

  });
  
  $("#distInput").on("tagAdd",function(e,tag){

    for(i=0;i<coronaData.length;i++){
      for(j=0;j<coronaData[i].districtData.length;j++){
        if(coronaData[i].districtData[j].district == tag){
          listDist.push(coronaData[i].districtData[j]);
          break;
        }
      }
    }

    for(i=0;i<zoneData.length;i++){
      if(zoneData[i].district == tag){
        listZone.push(zoneData[i]);
        break;
      }
    }

  });

});


