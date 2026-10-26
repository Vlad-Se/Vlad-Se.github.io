$(function () {
  var body = document.getElementsByTagName("body")[0];
  var bodyScrollTop = null;
  var locked = false;

  function lockScroll() {
    if (!locked) {
      bodyScrollTop =
        typeof window.pageYOffset !== "undefined"
          ? window.pageYOffset
          : (
              document.documentElement ||
              document.body.parentNode ||
              document.body
            ).scrollTop;
      body.classList.add("scroll-locked");
      body.style.top = ` -${bodyScrollTop}px`;
      locked = true;
    }
  }

  function unlockScroll() {
    if (locked) {
      body.classList.remove("scroll-locked");
      body.style.top = null;
      locked = false;
      $("html, body").animate({ scrollTop: bodyScrollTop }, 0);
    }
  }
  function getYearsPassed(dateString) {
    const birthDate = new Date(dateString);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      years--;
    }

    return years;
  }
  function loadData(key) {
    // Делаем запрос к локальному JSON файлу
    fetch("site.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ошибка загрузки файла");
        }
        return response.json(); // Превращаем текст в объект JS
      })
      .then((data) => {
        // Проверяем, есть ли такой ключ в JSON
        if (data[key]) {
          // Меняем текст на странице
          document.getElementById("project-title").innerText = data[key].title;
          document
            .getElementById("project-title")
            .setAttribute("href", data[key].link);
          document.getElementById("project-subtitle").innerText =
            data[key].subtitle;
          document.getElementById("project-text").innerHTML = data[key].content;
          const box = document.getElementById("project-content");
          const boxBg = document.getElementById("project-bg");
          lockScroll();
          box.classList.add("show");
          boxBg.classList.add("show");
          setTimeout(() => {
            box.classList.add("fade-in");
            boxBg.classList.add("fade-in");
            $(".project-content__container").mCustomScrollbar({ axis: "y" });
          }, 10);
        } else {
          console.error("Данные не найдены");
        }
      })
      .catch((error) => console.error("Ошибка:", error));
  }

  $(function () {
    $(document).ready(function (e) {
      /* Опыт работы */
      const dateStr = $("#my-date").data("date");
      const years = getYearsPassed(dateStr);

      $(".year-result").text(years);
      /* Якорь */
      $(".scroll").click(function () {
        unlockScroll();
        $(".header__butter").removeClass("_open");
        $(".header__nav").removeClass("_open");
        $(".project-bg").removeClass("fade-in");
        setTimeout(function () {
          $(".project-bg").removeClass("show");
        }, 200);
        let idScroll = $(this).attr("href");
        let destination = $(idScroll).offset().top - 60;
        $("html").animate({ scrollTop: destination }, 1100);
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
    /* Проекты */
    $(document).on("click", ".projects__list-item", function () {
      let nameElement = $(this).attr("data-project");
      loadData(nameElement);
    });
    $(".project-content__close").click(function () {
      unlockScroll();
      let thisEl = $(this);
      thisEl.closest(".project-content").removeClass("fade-in");
      $(".project-bg").removeClass("fade-in");
      setTimeout(function () {
        thisEl.closest(".project-content").removeClass("show");
        $(".project-bg").removeClass("show");
      }, 200);
    });
    $(document).mouseup(function (e) {
      var div = $(".project-content");
      if (div.hasClass("fade-in")) {
        if (!div.is(e.target) && div.has(e.target).length === 0) {
          unlockScroll();
          div.removeClass("fade-in");
          $(".project-bg").removeClass("fade-in");
          setTimeout(function () {
            div.removeClass("show");
            $(".project-bg").removeClass("show");
          }, 200);
        }
      }
    });
    let currentIndex = 0; // С какого элемента массива начинать загрузку
    let perPage;
    $("#load-more").on("click", function () {
      const button = $(this);
      if ($(window).width() <= 991 && $(window).width() > 768) {
        perPage = 4;
      } else {
        perPage = 3;
      }

      // Отправляем GET-запрос к локальному файлу с данными
      $.ajax({
        url: "load-more.json",
        type: "GET",
        dataType: "json",
        beforeSend: function () {
          button.text("Загрузка...").prop("disabled", true);
        },
        success: function (data) {
          const chunk = data.slice(currentIndex, currentIndex + perPage);

          // Добавляем элементы на страницу
          chunk.forEach(function (item) {
            const html = `${item.block}`;
            $("#projects-list").append(html);
          });

          // Увеличиваем счетчик для следующего клика
          currentIndex += perPage;

          // Возвращаем кнопку в исходное состояние
          button.text("Показать ещё").prop("disabled", false);

          // Если данные в массиве закончились — скрываем кнопку
          if (currentIndex >= data.length) {
            button.hide();
          }
        },
        error: function (xhr, status, error) {
          console.error("Ошибка загрузки данных:", error);
          button.text("Ошибка. Попробовать снова").prop("disabled", false);
        },
      });
    });
    /* Работа с меню */
    let widthLinemenu, leftLinemenu, distance;
    $(".header__nav-item").mouseover(function (event) {
      widthLinemenu = $(this).find("a").width();
      leftLinemenu = $(this).find("a");
      distance = $(this).find("a").position().left;
      if (event.relatedTarget.nodeName == "nav") {
        $(".header__nav-line").css({
          width: widthLinemenu,
          transition: "all 0.3s ease-in-out",
          left: distance,
        });
      } else {
        $(".header__nav-line").css({ transition: "0", left: distance });
        $(".header__nav-line").css({
          width: widthLinemenu,
          transition: "all 0.3s ease-in-out",
        });
      }
    });
    $(".header__nav-item").mouseout(function (event) {
      $(".header__nav-line").css({ width: "0" });
    });
    /* Мобильное меню */
    $(".header__butter").click(function () {
      if ($(this).hasClass("_open")) {
        unlockScroll();
        $(this).removeClass("_open");
        $(".header__nav").removeClass("_open");
        $(".project-bg").removeClass("fade-in");
        setTimeout(function () {
          $(".project-bg").removeClass("show");
        }, 200);
      } else {
        lockScroll();
        $(this).addClass("_open");
        $(".header__nav").addClass("_open");
        $(".project-bg").addClass("show");
        setTimeout(function () {
          $(".project-bg").addClass("fade-in");
        }, 10);
      }
    });
    new WOW().init();
  });
});
