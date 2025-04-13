// set popup size
const HTML = document.querySelector('html')
HTML.style.width = `${screen.width*.5}px`

//#region  Generate Collections

/**
 * Generate optimized RGB colors with distinct differences
 * @param {number} step - Color step increment (default: 10)
 * @returns {Array} - Array of generated colors
 */
function generateOptimizedRGBColors(step = 10) {
    console.log("🎨 Generating optimized RGB colors...");

    const colors = [];
    for (let r = 0; r < 256; r += step) {
        for (let g = 0; g < 256; g += step) {
            for (let b = 0; b < 256; b += step) {
                const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                colors.push({
                    rgb: `rgb(${r}, ${g}, ${b})`,
                    hex: hex,
                    r: r, g: g, b: b
                });
            }
        }
    }

    console.log(`✅ Generated ${colors.length} colors`);
    return colors;
}

/**
 * Convert RGB to HSL color space
 */
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Filter similar colors using color distance
 */
function filterSimilarColors(colors, minDistance = 20) {
    console.log(`🔍 Filtering similar colors (min distance: ${minDistance})...`);
    const uniqueColors = [];

    colors.forEach(color => {
        const isUnique = uniqueColors.every(uc => {
            const dr = uc.r - color.r;
            const dg = uc.g - color.g;
            const db = uc.b - color.b;
            return Math.sqrt(dr * dr + dg * dg + db * db) >= minDistance;
        });
        if (isUnique) uniqueColors.push(color);
    });

    console.log(`✅ ${uniqueColors.length} distinct colors remaining`);
    return uniqueColors;
}

/**
 * Categorize colors into meaningful groups
 */
function categorizeColors(colors) {
    console.log("📂 Categorizing colors...");
    const categories = {
        red: [], orange: [], yellow: [], green: [],
        cyan: [], blue: [], purple: [], magenta: [],
        pink: [], brown: [], gray: [], white: [], black: []
    };

    colors.forEach(color => {
        const { r, g, b } = color;
        const { h, s, l } = rgbToHsl(r, g, b);

        // Neutral colors
        if (s < 10) {
            if (l > 90) categories.white.push(color);
            else if (l < 10) categories.black.push(color);
            else categories.gray.push(color);
            return;
        }

        // Colorful colors
        if (h < 15 || h >= 345) categories.red.push(color);
        else if (h >= 15 && h < 45) categories.orange.push(color);
        else if (h >= 45 && h < 75) categories.yellow.push(color);
        else if (h >= 75 && h < 165) categories.green.push(color);
        else if (h >= 165 && h < 195) categories.cyan.push(color);
        else if (h >= 195 && h < 255) categories.blue.push(color);
        else if (h >= 255 && h < 285) categories.purple.push(color);
        else if (h >= 285 && h < 315) categories.magenta.push(color);
        else if (h >= 315 && h < 345) categories.pink.push(color);

        // Special case for brown
        if ((h >= 10 && h < 45) && l < 40 && s > 20) {
            categories.brown.push(color);
        }
    });

    console.log("✅ Categorization complete!");
    return categories;
}

// Generate and process colors
const step = 15; // Larger step = fewer colors
const colors = generateOptimizedRGBColors(step);
const uniqueColors = filterSimilarColors(colors);
const categorizedColors = categorizeColors(uniqueColors);

// Output JSON

//#endregion

//#region Insert Collections To DOM
Object.keys(categorizedColors).forEach(category => {
    GenerateColorCategory(category)
})

//generators

function GenerateColorCategory(category) {
    const colorContainer = document.createElement('div')
    colorContainer.classList.add('color-container', 'hide')

    //card header
    const cardHeader = document.createElement('div')
    cardHeader.classList.add('card-header')
    cardHeader.innerHTML = `
        <h3>${category} <small>( ${categorizedColors[category].length} colors )</small></h3>
        <i class="bi bi-caret-down"></i>
    `
    cardHeader.onclick = function (e) { CardHeaderClick(e) }
    const cardBody = document.createElement('div')
    cardBody.classList.add('card-body')

    colorContainer.appendChild(cardHeader)
    categorizedColors[category].forEach(item => {
        GenerateColorBox(cardBody, item.hex)

    })
    colorContainer.appendChild(cardBody)


    document.querySelector('#container').appendChild(colorContainer)
}

function GenerateColorBox(cardBody, hex) {
    const colorBox = document.createElement('div')
    colorBox.classList.add('color-box')
    colorBox.innerHTML = `
        <h3 class="hex">${hex}</h3>
    `
    colorBox.style.setProperty('--hex', hex)
    colorBox.onclick = function (e) { ColorBoxClick(e) }
    cardBody.appendChild(colorBox)
}

//events
function CardHeaderClick(e) {
    var container = e.target.parentElement
    container.classList.toggle('hide');
}
function ColorBoxClick(e) {
    var el = e.target
    navigator.clipboard.writeText(el.innerHTML)
    alert('Color Copied Successfully')
}

document.getElementById('color-picker').addEventListener('click', (e) => {
    if (!window.EyeDropper) {
        alert("Your browser does not support the EyeDropper API")
        return;
    }
    const eyeDropper = new EyeDropper()
    const abortController = new AbortController()
    HTML.classList.add('close')
    eyeDropper
        .open({ signal: abortController.signal })
        .then((result) => {
            HTML.classList.remove('close')
            navigator.clipboard.writeText(result.sRGBHex)
            alert("Hex Code Copied")
        })
        .catch((e) => {
            alert(`Error : ${e}`)
        });
})

document.getElementById('github').addEventListener('click', (e) => {
    open('https://github.com/cheloei/MachColorChrome', '_blank')
})
//#endregion