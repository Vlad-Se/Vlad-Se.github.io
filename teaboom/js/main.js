$("body").removeClass("no-js");
$(function () {
  function radiob(this_pick, class_one, class_activ) {
    if (this_pick.children("input").prop("checked") == false) {
      var name_rad = this_pick.children("input").attr("Name");
      $("input[name=" + name_rad + "]").each(function () {
        $(this).parent().removeClass(class_activ);
        $(this).removeAttr("checked");
      });
      this_pick.addClass(class_activ);
      this_pick.children("input").attr("checked", "checked");
    }
  }
  function radiob_val(this_pick, class_activ) {
    if (this_pick.children("input").prop("checked") == true) {
      this_pick.addClass(class_activ);
      this_pick.children("input").attr("checked", "checked");
      this_pick
        .closest(".quiz__step")
        .find(".quiz__step-btns-next")
        .fadeIn(200);
    }
  }
  $(document).ready(function (e) {
    /* Слайдер типа штакетника */
    if ($(".product__photo-big").length) {
      new Swiper(".product__photo-big", {
        spaceBetween: 0,
        slidesPerView: 1,
        grabCursor: true,
        navigation: {
          nextEl: ".product__photo-big-next",
          prevEl: ".product__photo-big-prev",
        },
      });
    }
    /* Якорь */
    $(".scroll").click(function () {
      let idScroll = $(this).attr("href");
      let destination = $(idScroll).offset().top;
      $("html").animate({ scrollTop: destination }, 1100);
    });
    /* Радио кнопки */
    $(".product__info-pack-item").each(function () {
      radiob_val($(this), "_active");
    });
    $(".product__info-pack-item").click(function () {
      radiob($(this), ".product__info-pack-item", "_active");
      let art = $(this).find("input[name=article]").val();
      let oldprice = $(this).find("input[name=oldprice]").val();
      let price = $(this).find("input[name=price]").val();
      $(".product__info-top-article").find("span").text(art);
      $("input[name=article_cart").val(art);
      $(".product__info-bottom-oldprice").find("span").text(oldprice);
      $(".product__info-bottom-price").find("span").text(price);
    });
    /* Кнопка в корзину */
    $(".product__info-bottom-cart").click(function (e) {
      e.preventDefault();
      $(this).addClass("_hidden");
      $(".product__info-bottom-link").addClass("_active");
    });
    /* Описание */
    $(".tabs-product__top span").click(function () {
      let indexEl = $(this).index();
      $(this).siblings().removeClass("_active");
      $(this).addClass("_active");
      $(".tabs-product__bottom-item")
        .eq(indexEl)
        .siblings()
        .css({ display: "none" });
      $(".tabs-product__bottom-item").eq(indexEl).css({ display: "block" });
    });
  });
});
