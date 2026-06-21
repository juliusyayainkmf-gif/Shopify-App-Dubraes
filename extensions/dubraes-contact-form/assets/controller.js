let currentIndex = 0;
let VARIANT_ID_WITH_CUSTOMIZATION = 55617681424457;
let VARIANT_ID_WITHOUT_CUSTOMIZATION = 55617681391689;
let VARIANT_ID = 0;
let dubraeVariantIdsPromise = null;
const visibleSide = 2;

// =========================
// Update model color
// =========================

function updateModelColor() {
  const activeBtn = buttons[currentIndex];
  const color = activeBtn.dataset.color;

  DubraeApp.activeColor = activeBtn.dataset.title;

  if (!color) return;

  if (mainColor.classList.contains("btn-active")) {
    DubraeApp.dubraes.forEach((child) => {

      child.material.color.set(color).convertSRGBToLinear();
      
      child.material.metalness = 0.6;
      child.material.roughness = 0.2;
      child.material.needsUpdate = true;
    });
    DubraeApp.airforceShoe.forEach((child) => {
      if (child.name.includes("airforce_medium_dubrae")) {

        child.material.color.set(color).convertSRGBToLinear();
        child.material.needsUpdate = true;
      }
    });
  } else if (DubraeApp.activeMesh && DubraeApp.activeMesh.name.includes("Plane_Plane")) {
    if (Array.isArray(DubraeApp.activeMesh.material)) {
      DubraeApp.activeMesh.material.forEach((mat) => {
        if (!mat.color) return;
        mat.color.set(color).convertSRGBToLinear();
        mat.needsUpdate = true;
      });
    } else if (DubraeApp.activeMesh.material?.color) {
      DubraeApp.activeMesh.material.color.set(color).convertSRGBToLinear();
      DubraeApp.activeMesh.material.needsUpdate = true;
    }
  }
}

function changeAllLogoColors(color, title) {
  const updateMaterial = (material) => {
    if (Array.isArray(material)) {
      material.forEach((mat) => {
        mat.metalness = 0.6;
        mat.roughness = 0.2;
        mat.color.set(color).convertSRGBToLinear();
        mat.needsUpdate = true;
      });
    } else {
      material.metalness = 0.6;
      material.roughness = 0.2;
      material.color.set(color).convertSRGBToLinear();
      material.needsUpdate = true;
    }
  };

  Object.values(DubraeApp.customLogosClones).forEach((logo) => {
    if (!logo) return;

    logo.traverse((child) => {
      if (child.isMesh) {
        updateMaterial(child.material);
      }
    });
  });
  
  DubraeApp.customLogosColor = color;
  DubraeApp.activeLogoColor = title;
}

function changeTextColors(button) {
    button.addEventListener("click", () => {
    const color = button.dataset.color;
    const title = button.dataset.title;

    DubraeApp.activeTextColor = color;
    DubraeApp.activeTextColorTitle = title;

    DubraeApp.textClones.forEach((textClone) => {
      textClone.material.color.set(color).convertSRGBToLinear();
      textClone.material.needsUpdate = true;
    });
  });
}

// =========================
// UI buttons
// =========================

const mainColor = document.querySelector(".main-color");
// const splitColor = document.querySelector(".split-color");
const buttons = document.querySelectorAll(".color-btn");
const fontButtons = document.querySelectorAll(".font-btn");
const textButtons = document.querySelectorAll(".color-btn-personalization");

mainColor.addEventListener("click", function () {
  this.classList.add("btn-active");
  // splitColor.classList.remove("btn-active");
});

// splitColor.addEventListener("click", function () {
//   this.classList.add("btn-active");
//   mainColor.classList.remove("btn-active");
// });

document.addEventListener("DOMContentLoaded", function () {
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));

  const helpBtn = document.getElementById('helpBtn');
  const helpModal = document.getElementById('helpModal');
  const closeBtn = document.getElementById('closeHelpModal');
  const overlay = document.querySelector('.help-modal-overlay');

  helpBtn.addEventListener('click', function () {
    helpModal.classList.add('active');
  });

  closeBtn.addEventListener('click', function () {
    helpModal.classList.remove('active');
  });

  overlay.addEventListener('click', function () {
    helpModal.classList.remove('active');
  });
});

buttons.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    currentIndex = i;
    updateModelColor();
  });
});

textButtons.forEach((button) => { 
  changeTextColors(button);
});

fontButtons.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    fontButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    btn.classList.add("active");

    DubraeApp.activeFont = btn.dataset.font;

    const customText = document.getElementById("customText");
    DubraeApp.addText3D(customText.value);
  });
});

document.querySelectorAll(".logo-color-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const selectedColor = e.currentTarget.dataset.color;
    const selectedTitle = e.currentTarget.dataset.title;
    changeAllLogoColors(selectedColor, selectedTitle);
  });
});

const logoSizeSlider = document.getElementById("logoSizeSlider");

logoSizeSlider.addEventListener("input", (e) => {
  const scale = parseFloat(e.target.value);

  DubraeApp.updateLogoSize(scale);
});

function showCartStatus(title, message) {
  const overlay = document.getElementById("addToCartStatus");

  document.getElementById("cartStatusTitle").innerText = title;
  document.getElementById("cartStatusMessage").innerText = message;

  overlay.classList.add("show");

  setTimeout(() => {
    overlay.classList.remove("show");
  }, 3000);
}

// =========================
// PDF Btn
// =========================

const pdfBtn = document.getElementById("pdfBtn");

pdfBtn.addEventListener("click", async () => {
  try {
    const pdfBytes = await DubraeApp.generatePDF();
    DubraeApp.downloadPDF(pdfBytes);
  } catch (err) {
    console.error(err);
  }
});


// =========================
// Add to Cart
// =========================

function showCartStatus(title, message, autoHide = false) {
  const overlay = document.getElementById("addToCartStatus");

  document.getElementById("cartStatusTitle").innerText = title;
  document.getElementById("cartStatusMessage").innerText = message;

  overlay.classList.add("show");

  if (autoHide) {
    setTimeout(() => {
      overlay.classList.remove("show");
    }, 3000);
  }
}

function hideCartStatus() {
  const overlay = document.getElementById("addToCartStatus");
  overlay.classList.remove("show");
}

async function getDubraeVariantIds() {
  if (!dubraeVariantIdsPromise) {
    const shop = window.Shopify?.shop;

    dubraeVariantIdsPromise = shop
      ? fetch(`https://shopify-app-dubraes.onrender.com/api/dubraes-variants?shop=${encodeURIComponent(shop)}`)
          .then((response) => response.json())
          .then((data) => {
            if (!data?.success) {
              console.warn("Dubraes variant endpoint error:", data?.message);
              return null;
            }

            return data.variants;
          })
          .catch((error) => {
            console.warn("Could not load Dubraes variant IDs from app:", error);
            return null;
          })
      : Promise.resolve(null);
  }

  return dubraeVariantIdsPromise;
}

async function getCartErrorMessage(response) {
  try {
    const data = await response.json();
    return data.description || data.message || data.status || response.statusText;
  } catch (error) {
    return response.statusText;
  }
}

async function handleUploadCustomLogo(configId) {
  try {
    const base64 = DubraeApp.customLogoImage;

    if (!base64) {
      console.warn("No custom logo found");
      return null;
    }

    const res = await fetch(base64);
    const blob = await res.blob();

    const formData = new FormData();
    formData.append("file", blob, "custom-logo.png");
    formData.append("configId", configId);

    const response = await fetch("https://shopify-app-dubraes.onrender.com/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    return data.url;

  } catch (err) {
    console.error("Logo upload error:", err);
  }
}

async function handleUploadPDF(configId) {
  try {
    const pdfBytes = await window.DubraeApp.generatePDF();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    const formData = new FormData();
    formData.append("file", blob, "config.pdf");
    formData.append("configId", configId);

    const res = await fetch("https://shopify-app-dubraes.onrender.com/api/upload-pdf", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    return data.url;

  } catch (err) {
    console.error(err);
  }
}

async function addToCart() {
  const btn = document.getElementById("addToCart");
  const el = document.getElementById("backButton");
  if (el) el.click();

  try {
    const uniqueId = crypto.randomUUID();

    const hasCustomization =
      DubraeApp.selectedOptions.text ||
      !!DubraeApp.customLogoImage;

    const appVariantIds = await getDubraeVariantIds();
    const VARIANT_ID = hasCustomization
      ? appVariantIds?.withCustomization || VARIANT_ID_WITH_CUSTOMIZATION
      : appVariantIds?.withoutCustomization || VARIANT_ID_WITHOUT_CUSTOMIZATION;

    const hasCustomLogo = !!DubraeApp.customLogoImage;
    const totalSteps = hasCustomLogo ? 3 : 2;

    btn.disabled = true;
    btn.innerText = "Processing...";

    showCartStatus(`Step 1/${totalSteps}`, "Adding to cart...");

    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: VARIANT_ID,
        quantity: 1,
        properties: {
          _configID: uniqueId,
          "Design ID": uniqueId,
          "Model": DubraeApp.capitalizeFirst(DubraeApp.activeModel),
          "Main Color": DubraeApp.capitalizeFirst(DubraeApp.activeColor),
          "Text": DubraeApp.activeText,
          "Font Color": DubraeApp.activeText !== "N/a" ? DubraeApp.capitalizeFirst(DubraeApp.activeTextColorTitle) : "N/a",
          "Font Style": DubraeApp.activeText !== "N/a" ? DubraeApp.capitalizeFirst(DubraeApp.activeFont) : "N/a",
          "Custom Logo": DubraeApp.capitalizeFirst(DubraeApp.activeCustomLogo),
          "Logo Color": DubraeApp.customLogoImage ?  DubraeApp.capitalizeFirst(DubraeApp.activeLogoColor) : "N/a",
        }
      })
    });

    if (!res.ok) {
      throw new Error(await getCartErrorMessage(res));
    }

    await res.json();

    showCartStatus(`Step 2/${totalSteps}`, "Uploading PDF...");
    await handleUploadPDF(uniqueId);

    if (hasCustomLogo) {
      showCartStatus(`Step 3/${totalSteps}`, "Uploading logo...");
      await handleUploadCustomLogo(uniqueId);
    }
    
    showCartStatus("Success", "Everything uploaded!");

    setTimeout(() => {
      hideCartStatus();
    }, 1200);

  } catch (err) {
    console.error(err);

    showCartStatus("Error", "Something went wrong.");

    setTimeout(() => {
      hideCartStatus();
    }, 2000);

  } finally {
    btn.disabled = false;
    btn.innerText = "Add to Cart";
  }
}

document.getElementById("addToCart").addEventListener("click", addToCart);
