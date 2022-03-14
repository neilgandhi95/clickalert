var $ = require( "jquery" );

console.log("bro");


// Each block for more info
const infoBlock = 
'<div class="bg-slate-100 p-4 space-y-4 rounded-md border border-slate-200">'+
	'<div>'+
		'<label for="page-title" class="block font-medium text-sm text-slate-700">Heading</label>'+
		'<input type="text" name="page-title" id="page-title" class="border border-slate-200 rounded-md shadow-sm py-2 px-3 transition w-full mt-1" placeholder="Here are some of our features">'+
	'</div>'+
	'<div>'+
		'<label for="page-title" class="block font-medium text-sm text-slate-700">Content</label>'+
		'<textarea class="w-full bg-white border border-slate-200 rounded-md shadow-sm py-2 px-3 transition mt-1"></textarea>'+
	'</div>'+
'</div>';

$("#add_info-block").click(function() {
	$("#container_info").append(infoBlock);
})