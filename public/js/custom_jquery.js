$(document).ready(function(){

$('.table > tbody > tr').click(function() {
    window.open($(this).attr('href'));
});

});