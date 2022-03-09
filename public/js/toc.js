

const thumbHeight = $("#toc li").first().height();

console.log(thumbHeight);
$("#toc_thumb").css("height", thumbHeight + "px");

$(window).scroll(function(){

    var wintop = $(window).scrollTop(), docheight = $(document).height(), winheight = $(window).height();
    var  scrolltrigger = 0.95;

    const percentScrolled = (wintop/(docheight-winheight));
    console.log('%scrolled='+percentScrolled);

    const tst = ($("#toc").height() - $("#toc_thumb").height())*percentScrolled;

    $("#toc_thumb").css("top", tst + "px");

    if  ((wintop/(docheight-winheight)) > scrolltrigger) {
       console.log('scroll bottom');
    }
});