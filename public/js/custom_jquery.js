$(document).ready(function(){

$('.event-item').click(function() {
    window.open($(this).attr('href'));
});


// updting events

$('.to-trash-btn').click(function(e) {
	event_id = $(this).parent().parent().attr('id');
	window.location.replace('update/' + event_id + '/move/trash');
	e.stopPropagation();
});

$('.to-local-btn').click(function(e) {
	event_id = $(this).parent().parent().attr('id');
	window.location.replace('update/' + event_id + '/move/local');
	e.stopPropagation();
});

$('.to-new-btn').click(function(e) {
	event_id = $(this).parent().parent().attr('id');
	window.location.replace('update/' + event_id + '/move/new');
	e.stopPropagation();
});

$('.reset-btn').click(function(e) {
	event_id = $(this).parent().parent().attr('id');
	window.location.replace('update/' + event_id + '/reset');
	e.stopPropagation();
});

$('.remove-btn').click(function(e) {
	event_id = $(this).parent().parent().attr('id');
	window.location.replace('update/' + event_id + '/remove');
	e.stopPropagation();
});

});