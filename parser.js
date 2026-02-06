"use strict";

function parsePage() {
  return {
    meta: {
      title: getPageTitle(),
      description: getPageDescription(),
      language: getPageLanguage(),
      keywords: getPageKeywords(),
      opengraph: getOpenGraph(),
    },
    product: {
      id: getProductId(),
      name: getProductTitle(),
      images: getProductImages(),
      isLiked: isLiked(),
      tags: getTags(),
      price: getDiscountedPrice(),
      oldPrice: getBasePrice(),
      discount: getDiscount(),
      discountPercent: getDiscountPercent(),
      currency: getCurrency(),
      properties: getProperties(),
      description: getFullDescription(),
    },
    suggested: getSuggestedProducts(),
    reviews: getReviewList(),
  };
}

function getPageLanguage() {
  const htmContainer = document.querySelector("html");
  return htmContainer.lang;
}

function getPageTitle() {
  const metaTitle = document.querySelector('meta[property="og:title"]');
  const arr = metaTitle.content.split("—");
  const title = arr[0].trim();
  return title;
}

function getPageKeywords() {
  const metaKeywords = document.querySelector('meta[name="keywords"]');
  if (!metaKeywords?.content) return [];
  return metaKeywords.content
    .split(",") // Разбиваем строку по запятым
    .map((key) => key.trim()) // Убираем пробелы
    .filter(Boolean); // Выкидываем все пустое
}

function getPageDescription() {
  const metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription?.content) return "";
  return metaDescription.content.trim();
}

function getOpenGraph() {
  const metas = document.querySelectorAll("meta[property^='og:']");
  const result = {};

  for (let meta of metas) {
    const property = meta.getAttribute("property").split(":").pop();
    let content = meta.content;

    if (property === "title") {
      content = content.split("—")[0].trim();
    }

    if (property && content) {
      result[property] = content;
    }
  }

  return result;
}

function getProductId() {
  const product = document.querySelector(".product");
  return product.dataset.id;
}

function getProductImages() {
  const product = document.querySelector(".product");
  const nav = product.querySelector("nav");
  const images = nav.querySelectorAll("img");
  const result = [];

  for (let img of images) {
    const imgPreviewLink = img.getAttribute("src");
    const imgFullSizeLink = img.getAttribute("data-src");
    const imgAlt = img.getAttribute("alt");

    result.push({
      preview: imgPreviewLink,
      full: imgFullSizeLink,
      alt: imgAlt,
    });
  }
  return result;
}

function isLiked() {
  const likeButton = document.querySelector("figure button");
  return likeButton?.classList.contains("active") ?? false;
}

function getProductTitle() {
  return document.querySelector("h1")?.textContent.trim() ?? "";
}

function getTags() {
  const tagList = document.querySelector(".tags").children;

  if (!tagList || tagList.length === 0) {
    return { category: [], discount: [], label: [] };
  }

  const result = {
    category: [],
    discount: [],
    label: [],
  };

  for (let tag of tagList) {
    if (tag.classList.contains("green")) {
      result.category.push(tag.textContent);
    }
    if (tag.classList.contains("blue")) {
      result.label.push(tag.textContent);
    }
    if (tag.classList.contains("red")) {
      result.discount.push(tag.textContent);
    }
  }

  return result;
}

function getPrices() {
  // Получаем массив из двух чисел, первое цена со скидкой, вторая без скидки.
  const price = document.querySelector(".price");
  if (!price) return [];
  return price.textContent
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getBasePrice() {
  const price = getPrices();
  return Number(price[1].slice(1)); // Убираем знак валюты.
}

function getDiscountedPrice() {
  const price = getPrices();
  return Number(price[0].slice(1)); // Убираем знак валюты.
}

function getDiscount() {
  const basePrice = getBasePrice();
  const discountPrice = getDiscountedPrice();

  if (basePrice - discountPrice === 0) return "0";

  return basePrice - discountPrice;
}

function getDiscountPercent() {
  const basePrice = getBasePrice();
  const discountPrice = getDiscountedPrice();

  if (basePrice - discountPrice === 0) return "0%";

  const percent = 100 - (discountPrice * 100) / basePrice;
  const formatted = percent % 1 === 0 ? percent : percent.toFixed(2); // Убираем дробную часть если число целое.

  return `${formatted}%`;
}

function getCurrencyBySymbol(symbol) {
  if (symbol === "$") return "USD";
  if (symbol === "€") return "EUR";
  if (symbol === "₽") return "RUB";
}

function getCurrency() {
  const prices = getPrices();
  return getCurrencyBySymbol(prices[0].charAt(0));
}

function getProperties() {
  const listProperties = document.querySelector(".properties");
  if (!listProperties) return {};

  const itemList = listProperties.querySelectorAll("li");
  const result = {};

  for (const item of itemList) {
    const spans = item.querySelectorAll("span");
    const key = spans[0].textContent.trim();
    const value = spans[1].textContent.trim();
    result[key] = value;
  }

  return result;
}

function getFullDescription() {
  const description = document.querySelector(".description");
  const elements = description.querySelectorAll("*");
  //Перебираем все элементы вложенные в description.
  for (let elem of elements) {
    // Если находим элемент с атрибутами - запускается цикл по удалению.
    if (elem.attributes.length > 0) {
      // Получаем массив атрибутов.
      const arr = Array.from(elem.attributes);
      // Удаляем каждый атрибут из массива.
      for (let attr of arr) {
        attr = elem.removeAttribute(attr.name);
      }
    }
  }

  return description.innerHTML.trim();
}

function getSuggestedProducts() {
  const suggested = document.querySelector(".suggested");
  if (!suggested) return [];

  const articles = suggested.querySelectorAll("article");
  const result = [];

  for (const article of articles) {
    const title = article.querySelector("h3").textContent;
    const description = article.querySelector("p").textContent;
    const image = article.querySelector("img").getAttribute("src");
    const price = article.querySelector("b").textContent;

    if (!title || !description || !image || !price) continue;

    result.push({
      name: title.trim(),
      description: description.trim(),
      image: image,
      price: price.slice(1).trim(),
      currency: getCurrencyBySymbol(price.charAt(0).trim()),
    });
  }
  return result;
}

function getReviewArticle() {
  const reviews = document.querySelector(".reviews");
  if (!reviews) return 0;

  const article = reviews.querySelector("article");
  if (!article) return 0;

  return article;
}

function getRating(article) {
  const starList = article.querySelector(".rating").children;
  if (!starList) return 0;

  let counter = 0;

  for (const star of starList) {
    if (star.classList.contains("filled")) {
      counter += 1;
    }
  }
  return counter;
}

function getReviewAuthorInfo(article) {
  const author = article.querySelector(".author");
  if (!author) return null;

  const result = {
    avatar: author.querySelector("img").getAttribute("src"),
    name: author.querySelector("span").textContent,
    date: author.querySelector("i").textContent,
  };

  return result;
}

function getReviewList() {
  const reviews = document.querySelector(".reviews");
  const articles = reviews.querySelectorAll("article");

  const result = [];

  for (const article of articles) {
    const rating = getRating(article);
    const author = getReviewAuthorInfo(article);
    const title = article.querySelector(".title").textContent;
    const description = article.querySelector("p").textContent;
    result.push({
      rating: rating,
      title: title.trim(),
      description: description.trim(),
      author: {
        avatar: author.avatar.trim(),
        name: author.name.trim(),
      },
      date: author.date.replaceAll("/", ".").trim(),
    });
  }

  return result;
}

window.parsePage = parsePage;
