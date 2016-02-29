(function ($) {

	var successEvent = new Event('easyFormOnSuccess');
	var errorEvent = new Event('easyFormOnError');
	var failEvent = new Event('easyFormOnFail');

	var defaultSuccessMessage = "Success";
	var defaultFailMessage = "Fail";
	var defaultErrorMessage = "Error";
	var defaultProcessText = "Proccessing";
	var defaultSubmitText = "Submit";
	var defaultDots = 3;
	var defaultInterval = 800;


	var generateRandomVaribleName = function(length){
		var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	    for( var i=0; i < length; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    return text;
	};


	var addDot = function(form, dots){
		var unique = $(form).attr('unique');
		if(typeof unique !== 'undefined'){
			var process = $(form).attr('processing');
			window[unique + "_dots"] = window[unique + "_dots"] || 1;
			var dotString = Array(window[unique + "_dots"] + 1).join(".");
			$(form).find('[for="form_processing"]').html(process + dotString);
			if(window[unique + "_dots"] >= dots){
				window[unique + "_dots"] = -1;
			}else{
				window[unique + "_dots"] = (window[unique + "_dots"] + 1);
			}
		}
	}

	var startDots = function(form, dots, interval){
		maxDots = dots || defaultDots;
		interval = interval || defaultInterval;
		var process = $(form).attr('processing');
		$(form).find('[for="form_processing"]').removeClass('hide').html(process);
		var unique = $(form).attr('unique');
		if(typeof unique !== 'undefined' && typeof window[unique] === 'undefined'){
			window[unique + "_dots"] = 1;
			window[unique] = setInterval(function(){addDot(form, maxDots);} ,interval);
		}
	};

	var endDots = function(form){
		$(form).find('[for="form_processing"]').addClass('hide');
		var unique = $(form).attr('unique');
		if(typeof unique !== 'undefined' && typeof window[unique] !== 'undefined'){
			clearInterval(window[unique]);
		}
	};

	


    $.fn.easyform = function(actions){
    	actions = actions || {};
    	var successMessage = actions['success'] || defaultSuccessMessage;
    	var failMessage = actions['fail'] || defaultFailMessage;
    	var errorMessage = actions['error'] || defaultErrorMessage;
    	var processMessage = actions['process'] || defaultProcessText;
    	var submitText = actions['submit'] || defaultSubmitText;
    	var maxDots = actions['dots'] || defaultDots;
    	var dotsInterval = actions['interval'] || defaultInterval;


    	// set form varible so we can use everywhere
    	var form = $(this);
    	// set unique identifier for each form
    	$(form).attr('unique', generateRandomVaribleName(20));
    	// set submit varible so we can use everywhere
    	var submit = $(form).find('input[type="submit"]');
    	// set for to validate
        $(form).validate();
        // add ajax field so we know this was an ajax request on the server side when javascript is enabled
		$(document.createElement('input')).attr('type', 'hidden').attr('id', 'request_type').attr('name', 'request_type').val('ajax').appendTo(form);
		// set all form response elements
		var form_success = $(form).find('[for="form_success"]');
		var form_fail = $(form).find('[for="form_fail"]');
		var form_error = $(form).find('[for="form_error"]');
		var form_processing = $(form).find('[for="form_processing"]');
		// check if form element exist and if not append them
		if($(submit).length == 0){
			submit = $(document.createElement('input')).attr('type', 'submit').val(submitText);
			$(submit).appendTo(form);
		}

		if($(form_success).length == 0){
			form_success = $(document.createElement('label')).attr('id', 'form_success').attr('for', 'form_success').addClass('form_success hide').html(successMessage);
			$(submit).after(form_success);
		}

		if($(form_fail).length == 0){
			form_fail = $(document.createElement('label')).attr('id', 'form_fail').attr('for', 'form_fail').addClass('form_fail hide').html(failMessage);
			$(submit).after(form_fail);
		}

		if($(form_error).length == 0){
			form_error = $(document.createElement('label')).attr('id', 'form_error').attr('for', 'form_error').addClass('form_error hide').html(errorMessage);
			$(submit).after(form_error);
		}

		if($(form_processing).length == 0){
			form_processing = $(document.createElement('label')).attr('id', 'form_processing').attr('for', 'form_processing').addClass('form_processing hide').html(processMessage);
			$(submit).after(form_processing);
		}

		$(form).attr('processing', $(form_processing).html());

		$(form).submit(function(){
			if($(form).valid() && !($(submit).attr('disabled') == "disabled")){
				$(submit).attr('disabled', 'disabled');
				startDots(form, maxDots, dotsInterval);
				$(form).find('[for="form_success"], [for="form_fail"], [for="form_error"]').addClass('hide');
				if($(form).attr('on_submit') && typeof window[$(form).attr('on_submit')] === "function"){
					eval($(form).attr('on_submit'))($(form));
				}
				$.ajax({
					type: $(form).attr('method') || "GET",
					url: $(form).attr('action') || document.location.href,
					data: $(form).find("input[type='hidden'], :not(.hide :input)").serialize(),
					async: true,
					dataType: "json",
					success: function(data){
						$(submit).removeAttr('disabled');
						endDots(form);
						if(data['success'] && data['success'] == true){
							$(form)[0].dispatchEvent(successEvent);
							$(form).find('[for="form_success"]').removeClass('hide');						
							if($(form).attr('on_success') && typeof window[$(form).attr('on_success')] === "function"){
								eval($(form).attr('on_success'))($(form), data);
							}
						}else{
							if(data['messages'] && data['messages'].length>0){
								for(var i=0;i < data.messages.length; i++){
									var message = data.messages[i].message || $('[name="'+data.messages[i].name+'"]').attr('data-msg-' + data.messages[i].validation) || failMessage;
									if($(form).find('#' + data.messages[i].name + "-error").length == 0){
										$(form).find('[name="'+data.messages[i].name+'"]').after($(document.createElement('label')).attr('id', data.messages[i].name + "-error").attr('for', data.messages[i].name).addClass('error'));
									}
									$(form).find('#' + data.messages[i].name + "-error").removeAttr('style').html(message).siblings("input, textarea, select").addClass('error');
									$(form).find('#' + data.messages[i].name).addClass('error').focus();
								}
							}else{
								$(form).find('[for="form_fail"]').removeClass('hide');
							}
							$(form)[0].dispatchEvent(failEvent);
							if($(form).attr('on_fail') && typeof window[$(form).attr('on_fail')] === "function"){
								eval($(form).attr('on_fail'))($(form), data);
							}
							
						}
						
					},
					error: function(jqXHR, text, error){
						$(submit).removeAttr('disabled');
						$(form)[0].dispatchEvent(errorEvent);
						endDots(form);
						$(form).find('[for="form_error"]').removeClass('hide');
						if($(form).attr('on_error') && typeof window[$(form).attr('on_error')] === "function"){
							eval($(form).attr('on_error'))($(form), jqXHR, text, error);
						}
						
					}
				});
				return false;
			}
		});
    };
}(jQuery));