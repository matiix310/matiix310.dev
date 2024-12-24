import { animate, stagger, inView, ElementOrSelector } from "motion";

function fadeInAnimation(elements: ElementOrSelector) {
  inView(
    elements,
    ({ target }) => {
      animate(
        target,
        { opacity: 1, transform: "none" },
        { delay: 0.2, duration: 0.7, easing: "ease-in-out" }
      );
    },
    { margin: "-20px 0px -20px 0px" }
  );
}

function runCommonAnimations() {
  const sections = [...document.getElementsByTagName("section")];
  const topBar = document.getElementById("topBarMenu")!;
  const topBarItems = [...topBar.getElementsByTagName("a")];

  const observerOptions: IntersectionObserverInit = {
    threshold: 0.7,
  };

  const observer = new IntersectionObserver((entries) => {
    const intersectedSections = entries.filter((e) => e.isIntersecting);
    if (intersectedSections.length == 0) return;
    const index = sections.findIndex((s) => s.id == intersectedSections[0].target.id) - 1;
    // reset
    topBarItems.forEach((v) => {
      v.classList.remove("active");
    });
    if (index >= 0 && index < topBarItems.length) {
      topBarItems[index].classList.add("active");
    }
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });

  // animate section titles
  const sectionTitles = [...document.getElementsByClassName("section-title")];
  fadeInAnimation(sectionTitles);

  // animate top bar
  fadeInAnimation(document.getElementById("topBar")!);
}

function runHomeSection() {
  // Mouse animation
  const section1Mouse = document.getElementById("section1Mouse");
  if (!section1Mouse) {
    console.error("#section1Mouse can't be found in the DOM");
    return;
  }

  const homeSection = document.getElementById("home");
  if (!homeSection) {
    console.error("#home can't be found in the DOM");
    return;
  }

  const resizeSection1Mouse = () => {
    const maxWidth = window.innerWidth * 3;
    const maxHeight = window.innerHeight * 3;
    const size = maxHeight > maxWidth ? maxWidth : maxHeight;

    section1Mouse.style.maskSize = size + "px " + size + "px";
  };

  homeSection.addEventListener("mousemove", (e) => {
    const halfSize = parseInt(section1Mouse.style.maskSize.split("px")[0]) / 2;
    section1Mouse.style.maskPosition =
      e.clientX - halfSize + "px " + (e.clientY - halfSize) + "px";
  });

  window.addEventListener("resize", () => {
    resizeSection1Mouse();
  });

  resizeSection1Mouse();

  // Matiix310 animation

  const drawStroke = (p: number) => ({
    strokeDashoffset: 1 - p,
    visibility: "visible",
  });

  animate("#home .title path", drawStroke(1), { delay: stagger(0.1) });
  animate(
    "#home .title path",
    { fill: "white" },
    { delay: stagger(0.1, { start: 0.2 }) }
  );
}

function runAboutSection() {
  const experienceContainers = [
    ...document.getElementsByClassName("experience-container"),
  ];

  fadeInAnimation(experienceContainers);
}

function runProjectsSection() {
  const projectsSection = document.getElementById("projects");
  if (!projectsSection) {
    console.error("#projects can't be found in the DOM");
    return;
  }

  const projects = [
    ...projectsSection.getElementsByClassName("project"),
  ] as HTMLAnchorElement[];

  projectsSection.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;

    for (let project of projects) {
      const boundingRect = project.getBoundingClientRect();
      project.style.setProperty("--x", (x - boundingRect.left).toString() + "px");
      project.style.setProperty("--y", (y - boundingRect.top).toString() + "px");
    }
  });

  fadeInAnimation(projects);
}

function runTechStackSection() {
  const techs = [...document.querySelectorAll("#techStack .techs div")];
  fadeInAnimation(techs);
}

// INIT
runCommonAnimations();
runHomeSection();
runAboutSection();
runProjectsSection();
runTechStackSection();
