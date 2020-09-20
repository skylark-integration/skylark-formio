define([
	'./createAutoCorrectedDatePipe',
	'./createNumberMask',
	'./emailMask',
],function(createAutoCorrectedDatePipe,createNumberMask,emailMask){
	return {
		createAutoCorrectedDatePipe,
		createNumberMask,
		emailMask
	};
})
