function on_submit(form){
	console.log("----------------");
	console.log("on_submit");
	console.log("form");
	console.log(form);
	console.log("----------------");
}

function on_success(form, data){
	console.log("----------------");
	console.log("on_success");
	console.log("form");
	console.log(form);
	console.log("data");
	console.log(data);
	console.log("----------------");
}

function on_fail(form, data){
	console.log("----------------");
	console.log("on_fail");
	console.log("form");
	console.log(form);
	console.log("data");
	console.log(data);
	console.log("----------------");
}

function on_error(form, jqXHR, text, error){
	console.log("----------------");
	console.log("on_error");
	console.log("form");
	console.log(form);
	console.log("jqXHR");
	console.log(jqXHR);
	console.log("text");
	console.log(text);
	console.log("error");
	console.log(error);
	console.log("----------------");
}

(function() {
	$(document).ready(function() {
		$('form').each(function(index, obj){
			$(obj).easyform({});
		});
	});
})();

