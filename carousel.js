const JSCarousel = ({
    carouselSelector,
    slideSelector,
    enablePagination = true,
    enableAutoplay = true,
    autoplayInterval = 5000,
  }) => {
    let currentSlideIndex = 0;
    let prevBtn, nextBtn;
    let autoplayTimer;
    let paginationContainer;
  
    const carousel = document.querySelector(carouselSelector);
  
    if (!carousel) {
      console.error("Specify a valid selector for the carousel.");
      return null;
    }
    const slides = carousel.querySelectorAll(slideSelector);
  
    if (!slides.length) {
      console.error("Specify a valid selector for slides.");
      return null;
    }
  
    const addElement = (tag, attributes, children) => {
      const element = document.createElement(tag);
  
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          element.setAttribute(key, value);
        });
      }
  
      if (children) {
        if (typeof children === "string") {
          element.textContent = children;
        } else {
          children.forEach((child) => {
            if (typeof child === "string") {
              element.appendChild(document.createTextNode(child));
            } else {
              element.appendChild(child);
            }
          });
        }
      }
  
      return element;
    };
  
    const tweakStructure = () => {
      carousel.setAttribute("tabindex", "0");
      carousel.style.overflow = "hidden";
      carousel.style.position = "relative";
  
      const carouselInner = addElement("div", { class: "carousel-inner" });
      carouselInner.style.display = "flex";
      carouselInner.style.transition = "transform 0.5s ease";
      carousel.insertBefore(carouselInner, slides[0]);
  
      if (enablePagination) {
        paginationContainer = addElement("nav", {
          class: "carousel-pagination",
          role: "tablist",
        });
        carousel.appendChild(paginationContainer);
      }
  
      slides.forEach((slide, index) => {
        carouselInner.appendChild(slide);
        slide.style.minWidth = "100%";
        slide.style.flex = "1 0 100%";
        slide.style.transform = `translateX(${index * 100}%)`;
  
        if (enablePagination) {
          const paginationBtn = addElement(
            "button",
            {
              class: `carousel-btn carousel-btn--${index + 1}`,
              role: "tab",
            },
            `${index + 1}`
          );
  
          paginationContainer.appendChild(paginationBtn);
  
          if (index === 0) {
            paginationBtn.classList.add("carousel-btn--active");
            paginationBtn.setAttribute("aria-selected", true);
          }
  
          paginationBtn.addEventListener("click", () => {
            handlePaginationBtnClick(index);
          });
        }
      });
  
      prevBtn = addElement(
        "button",
        {
          class: "carousel-btn carousel-btn--prev-next carousel-btn--prev",
          "aria-label": "Previous Slide",
        },
        "<"
      );
      prevBtn.style.position = "absolute";
      prevBtn.style.top = "50%";
      prevBtn.style.left = "10px";
      prevBtn.style.transform = "translateY(-50%)";
      carousel.appendChild(prevBtn);
  
      nextBtn = addElement(
        "button",
        {
          class: "carousel-btn carousel-btn--prev-next carousel-btn--next",
          "aria-label": "Next Slide",
        },
        ">"
      );
      nextBtn.style.position = "absolute";
      nextBtn.style.top = "50%";
      nextBtn.style.right = "10px";
      nextBtn.style.transform = "translateY(-50%)";
      carousel.appendChild(nextBtn);
    };
  
    const adjustSlidePosition = () => {
      slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${100 * (i - currentSlideIndex)}%)`;
      });
    };
  
    const updatePaginationBtns = () => {
      const paginationBtns = paginationContainer.children;
      Array.from(paginationBtns).forEach((btn) => {
        btn.classList.remove("carousel-btn--active");
        btn.removeAttribute("aria-selected");
      });
      const currActiveBtn = paginationBtns[currentSlideIndex];
      if (currActiveBtn) {
        currActiveBtn.classList.add("carousel-btn--active");
        currActiveBtn.setAttribute("aria-selected", true);
      }
    };
  
    const updateCarouselState = () => {
      if (enablePagination) {
        updatePaginationBtns();
      }
      adjustSlidePosition();
    };
  
    const moveSlide = (direction) => {
      currentSlideIndex = direction === "next"
        ? (currentSlideIndex + 1) % slides.length
        : (currentSlideIndex - 1 + slides.length) % slides.length;
      updateCarouselState();
    };
  
    const handlePaginationBtnClick = (index) => {
      currentSlideIndex = index;
      updateCarouselState();
    };
  
    const handlePrevBtnClick = () => moveSlide("prev");
    const handleNextBtnClick = () => moveSlide("next");
  
    const startAutoplay = () => {
      autoplayTimer = setInterval(() => {
        moveSlide("next");
      }, autoplayInterval);
    };
  
    const stopAutoplay = () => clearInterval(autoplayTimer);
  
    const handleMouseEnter = () => stopAutoplay();
    const handleMouseLeave = () => startAutoplay();
  
    const handleKeyboardNav = (event) => {
      if (!carousel.contains(event.target)) return;
      if (event.defaultPrevented) return;
  
      switch (event.key) {
        case "ArrowLeft":
          moveSlide("prev");
          break;
        case "ArrowRight":
          moveSlide("next");
          break;
        default:
          return;
      }
      event.preventDefault();
    };
  
    const attachEventListeners = () => {
      prevBtn.addEventListener("click", handlePrevBtnClick);
      nextBtn.addEventListener("click", handleNextBtnClick);
      carousel.addEventListener("keydown", handleKeyboardNav);
  
      if (enableAutoplay && autoplayInterval !== null) {
        carousel.addEventListener("mouseenter", handleMouseEnter);
        carousel.addEventListener("mouseleave", handleMouseLeave);
      }
    };
  
    const create = () => {
      tweakStructure();
      attachEventListeners();
      if (enableAutoplay && autoplayInterval !== null) {
        startAutoplay();
      }
    };
  
    const destroy = () => {
      prevBtn.removeEventListener("click", handlePrevBtnClick);
      nextBtn.removeEventListener("click", handleNextBtnClick);
      carousel.removeEventListener("keydown", handleKeyboardNav);
      if (enablePagination) {
        const paginationBtns = paginationContainer.querySelectorAll(".carousel-btn");
        paginationBtns.forEach((btn) => {
          btn.removeEventListener("click", handlePaginationBtnClick);
        });
      }
      if (enableAutoplay && autoplayInterval !== null) {
        carousel.removeEventListener("mouseenter", handleMouseEnter);
        carousel.removeEventListener("mouseleave", handleMouseLeave);
        stopAutoplay();
      }
    };
  
    return { create, destroy };
  };
  