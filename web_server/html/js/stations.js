var table = document.getElementsByTagName('table')[0];
var scanBtn = getE("startScan");
var scanTime = getE("scanTime");
var clientsFound = getE("clientsFound");
var scanStatus = getE("clientScanStatus");
var clientNames = getE('clientNames');
var nameListTable = getE('nameList');
var res;

function compare(a, b) {
  if (a.p > b.p) return -1;
  if (a.p < b.p) return 1;
  return 0;
}

function toggleBtn(onoff) {
  if (onoff) {
    scanStatus.style.visibility = 'visible';
  } else {
    scanStatus.style.visibility = 'hidden';
  }
}

function getResults() {
  getResponse("ClientScanResults.json", function(responseText) {
	try{
		res = JSON.parse(responseText);
	}catch(e){
		showMessage("Error: clear the client list.");
		return;
	}
    
    res.clients = res.clients.sort(compare);

    clientsFound.innerHTML = res.clients.length;

    var tr = '';
    if (res.clients.length > 0) tr += '<tr><th>Pkts</th><th>Vendor</th><th>Name</th><th>MAC</th><th>AP</th><th>Select</th></tr>';

    for (var i = 0; i < res.clients.length; i++) {

      if (res.clients[i].s == 1) tr += '<tr class="selected">';
      else tr += '<tr>';
      tr += '<td>' + res.clients[i].p + '</td>';
      tr += '<td>' + res.clients[i].v + '</td>';
      tr += '<td>' + res.clients[i].n + ' <a onclick="changeName(' + res.clients[i].i + ')">edit</a></td>';
      tr += '<td>' + res.clients[i].m + '</td>';
      tr += '<td>' + res.clients[i].a + '</td>';

      if (res.clients[i].s == 1) tr += '<td><button class="marginNull selectedBtn" onclick="select(' + res.clients[i].i + ')">deselect</button></td>';
      else tr += '<td><button class="marginNull" onclick="select(' + res.clients[i].i + ')">select</button></td>';

      tr += '</tr>';
    }
    table.innerHTML = tr;
	
	clientNames.innerHTML = res.nameList.length + "/50";

    var tr = '<tr><th>MAC</th><th>Name</th><th>X</th><th>Add</th></tr>';

    for (var i = 0; i < res.nameList.length; i++) {

      tr += '<tr>';
      tr += '<td>' + res.nameList[i].m + '</td>';
      tr += '<td>' + res.nameList[i].n + ' <a onclick="changeName(' + i + ')">edit</a></td>';
      tr += '<td><button class="marginNull button-warn" onclick="deleteName(' + i + ')">x</button></td>';
	  tr += '<td><button class="marginNull button-primary" onclick="add(' + i + ')">add</button></td>';
      tr += '</tr>';
    }

    nameListTable.innerHTML = tr;
	
  }, function() {
	  showMessage("reconnect and reload the site");
  }, 6000);

}

function scan() {
	toggleBtn(true);
	getResponse("ClientScan.json?time=" + scanTime.value, function(responseText) {
    if(responseText == "true") {
		setTimeout(function() {
			toggleBtn(true);
			getResults();
		}, scanTime.value * 1000);
	}
	else showMessage("response error ClientScan.json");
	});
}

function select(num) {
  getResponse("clientSelect.json?num=" + num, function(responseText) {
    if (responseText == "true") getResults();
    else showMessage("response error clientSelect.json");
  });
}

function clearNameList() {
  getResponse("clearNameList.json", function(responseText) {
    if (responseText == "true") getResults();
    else showMessage("response error clearNameList.json");
  });
}

function addClient(){
	getResponse("addClient.json?mac="+cMac.value+"&name="+cName.value, function(responseText) {
		if (responseText == "true") getResults();
		else showMessage("response error addClient.json");
	});
}

function changeName(id) {
  var newName = prompt("Name for " + res.nameList[id].m);
  if (newName != null) {
    getResponse("editNameList.json?id=" + id + "&name=" + newName, function(responseText) {
      if(responseText == "true") getResults();
      else showMessage("response error editNameList.json");
    });
  }
}

function deleteName(id) {
  getResponse("deleteName.json?num=" + id, function(responseText) {
    if (responseText == "true") getResults();
    else showMessage("response error deleteName.json");
  });
}

function add(id){
  getResponse("addClientFromList.json?num=" + id, function(responseText) {
    if (responseText == "true") getResults();
    else showMessage("response error addClientFromList.json");
  });
}

getResponse("ClientScanTime.json", function(responseText) {
  scanTime.value = responseText;
});

getResults();
toggleBtn(false);