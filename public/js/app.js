$('.form').hide();
$('.show').on('click',function(){
    $(this).siblings().toggle();
})