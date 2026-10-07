// ==========================================
// UTILIDADES SVG Y MATEMÁTICAS
// ==========================================
const SVG_SIZE = 350;
const GRID_MIN = -10;
const GRID_MAX = 10;
const SCALE = SVG_SIZE / (GRID_MAX - GRID_MIN);
const CENTER = SVG_SIZE / 2;

function mapX(x) { return CENTER + (x * SCALE); }
function mapY(y) { return CENTER - (y * SCALE); }

function drawGrid() {
    let svg = '';
    for (let i = GRID_MIN; i <= GRID_MAX; i++) {
        let x = mapX(i);
        let y = mapY(i);
        let isAxis = (i === 0);
        let stroke = isAxis ? '#64748b' : '#f1f5f9';
        let width = isAxis ? '2' : '1';
        
        svg += `<line x1="${x}" y1="0" x2="${x}" y2="${SVG_SIZE}" stroke="${stroke}" stroke-width="${width}"/>`;
        svg += `<line x1="0" y1="${y}" x2="${SVG_SIZE}" y2="${y}" stroke="${stroke}" stroke-width="${width}"/>`;
        
        if (i !== 0 && i % 2 === 0) {
            svg += `<text x="${x}" y="${CENTER + 15}" font-size="10" fill="#94a3b8" text-anchor="middle">${i}</text>`;
            svg += `<text x="${CENTER - 15}" y="${y + 4}" font-size="10" fill="#94a3b8" text-anchor="end">${i}</text>`;
        }
    }
    return svg;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function evaluateFunctionPath(pts, x) {
    for (let i = 0; i < pts.length - 1; i++) {
        if (x >= pts[i].x && x <= pts[i+1].x) {
            let m = (pts[i+1].y - pts[i].y) / (pts[i+1].x - pts[i].x);
            return pts[i].y + m * (x - pts[i].x);
        }
    }
    return 0;
}

// ==========================================
// EJERCICIO SÚPER COMPLETO (Funciones y Relaciones)
// ==========================================
function genSuperExercise(index, isFunction) {
    let pts = [];
    let pathD = '';
    
    // 1. Generar Puntos
    if (!isFunction) {
        // Zigzag que falla la prueba de la recta vertical (falla Unicidad)
        pts.push({x: randInt(-7, -5), y: randInt(-6, -2)});
        
        let p2x = randInt(4, 7);
        let p2y = randInt(4, 7);
        pts.push({x: p2x, y: p2y});
        
        let p3x = randInt(-4, 0);
        let p3y = randInt(-4, 0);
        pts.push({x: p3x, y: p3y});
        
        let p4x = randInt(5, 8);
        let p4y = randInt(-6, -2);
        pts.push({x: p4x, y: p4y});
    } else {
        let currX = randInt(-9, -5);
        let endX = randInt(5, 9);
        let currY = randInt(-4, 4);
        pts.push({x: currX, y: currY});

        let slopes = [1, -1, 0];
        let lastSlope = null;

        while (currX < endX) {
            let availableSlopes = slopes.filter(s => s !== lastSlope);
            let m = availableSlopes[randInt(0, availableSlopes.length - 1)];
            let dx = randInt(2, 4);
            if (currX + dx > endX) dx = endX - currX;
            
            let valid = false;
            while (!valid && dx >= 1) {
                if (Math.abs(currY + m * dx) <= 8) {
                    valid = true;
                } else {
                    dx--;
                }
            }
            if (!valid || dx === 0) {
                m = (currY > 0) ? -1 : 1;
                dx = randInt(2, 4);
                if (currX + dx > endX) dx = endX - currX;
            }

            currX += dx;
            currY += m * dx;
            pts.push({x: currX, y: currY});
            lastSlope = m;
        }
    }

    pathD = `M ${mapX(pts[0].x)} ${mapY(pts[0].y)}`;
    for (let i = 1; i < pts.length; i++) {
        pathD += ` L ${mapX(pts[i].x)} ${mapY(pts[i].y)}`;
    }

    // 2. Calcular Propiedades Generales
    let xVals = pts.map(p => p.x);
    let yVals = pts.map(p => p.y);
    let domMin = Math.min(...xVals);
    let domMax = Math.max(...xVals);
    let imgMin = Math.min(...yVals);
    let imgMax = Math.max(...yVals);

    let roots = new Set();
    for (let i = 0; i < pts.length - 1; i++) {
        let p1 = pts[i];
        let p2 = pts[i+1];
        if (p1.y === 0) roots.add(parseFloat(p1.x.toFixed(2)));
        if (p2.y === 0) roots.add(parseFloat(p2.x.toFixed(2)));
        if (p1.y * p2.y < 0) {
            let dx = p2.x - p1.x;
            let dy = p2.y - p1.y;
            if (dy !== 0) {
                let m = dy / dx;
                let r = p1.x - p1.y / m;
                roots.add(parseFloat(r.toFixed(2)));
            }
        }
    }
    let rootsArr = Array.from(roots).sort((a,b) => a-b);

    // 3. Propiedades Específicas
    let signIntervals = [];
    let behaviorIntervals = [];
    
    if (isFunction) {
        let criticalPts = Array.from(new Set([domMin, ...rootsArr, domMax])).sort((a,b) => a-b);
        for (let i = 0; i < criticalPts.length - 1; i++) {
            let midX = (criticalPts[i] + criticalPts[i+1]) / 2;
            let midY = evaluateFunctionPath(pts, midX);
            if (midY > 0) signIntervals.push({ start: criticalPts[i], end: criticalPts[i+1], expected: 'C+' });
            else if (midY < 0) signIntervals.push({ start: criticalPts[i], end: criticalPts[i+1], expected: 'C-' });
        }

        for (let i = 0; i < pts.length - 1; i++) {
            let m = (pts[i+1].y - pts[i].y) / (pts[i+1].x - pts[i].x);
            let b = (m > 0) ? 'Creciente' : (m < 0) ? 'Decreciente' : 'Constante';
            behaviorIntervals.push({ start: pts[i].x, end: pts[i+1].x, expected: b });
        }
    }

    const html = `
        <div class="exercise-header">Ejercicio ${index + 1}: Análisis Teórico</div>
        <div class="exercise-body">
            <div class="svg-container">
                <svg width="${SVG_SIZE}" height="${SVG_SIZE}">
                    ${drawGrid()}
                    <path d="${pathD}" stroke="#4f46e5" stroke-width="3" fill="none" stroke-linejoin="round"/>
                    <circle cx="${mapX(pts[0].x)}" cy="${mapY(pts[0].y)}" r="4" fill="#ef4444"/>
                    <circle cx="${mapX(pts[pts.length-1].x)}" cy="${mapY(pts[pts.length-1].y)}" r="4" fill="#ef4444"/>
                </svg>
            </div>
            
            <div class="questions-grid">
                
                <div class="q-section">
                    <h4>1. Clasificación</h4>
                    <p>¿La gráfica representa una función?</p>
                    <select class="ans-is-func">
                        <option value="?">Seleccione...</option>
                        <option value="si_ambas">Sí es función (cumple existencia y unicidad)</option>
                        <option value="no_unicidad">No es función (falla la propiedad de unicidad)</option>
                        <option value="no_existencia">No es función (falla la propiedad de existencia)</option>
                        <option value="no_ambas">No es función (falla unicidad y existencia)</option>
                    </select>
                    <div class="instant-feedback" style="margin-top: 10px; font-weight: bold; font-size: 0.95rem;"></div>
                </div>

                <div class="q-section">
                    <h4>2. Dominio e Imagen</h4>
                    <div class="interval-row">
                        <span>Dominio:</span>
                        <input type="text" class="ans-dom" placeholder="mín, máx">
                    </div>
                    <div class="interval-row">
                        <span>Imagen:</span>
                        <input type="text" class="ans-img" placeholder="mín, máx">
                    </div>
                </div>
                
                <div class="q-section">
                    <h4>3. Raíces (Ceros)</h4>
                    <input type="text" class="ans-roots" placeholder="Ej: -4, 0.5, 5">
                </div>
                
                ${isFunction ? `
                <div class="q-section function-only" style="display: none;">
                    <h4>4. Positividad y Negatividad</h4>
                    ${signIntervals.map((int, i) => `
                        <div class="interval-row">
                            <span>(${int.start} ; ${int.end})</span>
                            <select class="ans-sign" data-idx="${i}">
                                <option value="?">Seleccione...</option>
                                <option value="C+">Positividad (C+)</option>
                                <option value="C-">Negatividad (C-)</option>
                            </select>
                        </div>
                    `).join('')}
                </div>
                
                <div class="q-section function-only" style="display: none;">
                    <h4>5. Comportamiento</h4>
                    ${behaviorIntervals.map((int, i) => `
                        <div class="interval-row">
                            <span>De x=${int.start} a x=${int.end}</span>
                            <select class="ans-behavior" data-idx="${i}">
                                <option value="?">Seleccione...</option>
                                <option value="Creciente">Creciente</option>
                                <option value="Decreciente">Decreciente</option>
                                <option value="Constante">Constante</option>
                            </select>
                        </div>
                    `).join('')}
                </div>
                ` : `
                <div class="q-section non-function-note" style="display: none; background:#d1fae5; color:#065f46; border: 1px solid #34d399; margin-top: 1rem; padding: 1rem; border-radius: 8px;">
                    <p style="margin:0;"><strong>¡Excelente deducción!</strong> Al confirmar que la gráfica no es función porque falla la unicidad (un mismo 'x' tiene varios 'y'), ya no es necesario ni teóricamente correcto analizar los intervalos de positividad, negatividad ni crecimiento.</p>
                </div>
                `}
                
            </div>
        </div>
        <div class="feedback"></div>
    `;
    
    const el = document.createElement('div');
    el.className = 'exercise-card';
    el.innerHTML = html;
    
    // Lógica Interactiva para el Dropdown de Clasificación
    let expectedIsFunc = isFunction ? 'si_ambas' : 'no_unicidad';
    let selectEl = el.querySelector('.ans-is-func');
    let instantFb = el.querySelector('.instant-feedback');
    let functionOnlyBlocks = el.querySelectorAll('.function-only');
    let nonFunctionNote = el.querySelector('.non-function-note');

    selectEl.addEventListener('change', (e) => {
        let val = e.target.value;
        if (val === '?') {
            instantFb.textContent = "";
            functionOnlyBlocks.forEach(b => b.style.display = 'none');
            if (nonFunctionNote) nonFunctionNote.style.display = 'none';
        } else if (val === expectedIsFunc) {
            instantFb.textContent = "¡Correcto! Completa el resto del análisis.";
            instantFb.style.color = "var(--success-color)";
            if (isFunction) {
                functionOnlyBlocks.forEach(b => b.style.display = 'block');
            } else {
                if (nonFunctionNote) nonFunctionNote.style.display = 'block';
            }
        } else {
            instantFb.textContent = "Respuesta incorrecta sobre la clasificación. Analiza bien la gráfica.";
            instantFb.style.color = "var(--error-color)";
            functionOnlyBlocks.forEach(b => b.style.display = 'none');
            if (nonFunctionNote) nonFunctionNote.style.display = 'none';
        }
    });

    return {
        element: el,
        check: () => {
            let errors = [];
            
            // 1. Check Function classification
            let userIsFunc = el.querySelector('.ans-is-func').value;
            if (userIsFunc !== expectedIsFunc) {
                let correctText = isFunction ? 'Sí es función (cumple existencia y unicidad)' : 'No es función (falla la propiedad de unicidad)';
                errors.push(`<strong>Clasificación:</strong> La respuesta correcta era '${correctText}'.`);
                
                // Forzar mostrar las secciones si el usuario puso corregir sin haber acertado
                functionOnlyBlocks.forEach(b => b.style.display = 'block');
                if (nonFunctionNote) nonFunctionNote.style.display = 'block';
            }

            // 2. Check Domain
            let rawDom = el.querySelector('.ans-dom').value.replace(/\s/g, '').split(',').map(Number);
            if (rawDom.length !== 2 || rawDom[0] !== domMin || rawDom[1] !== domMax) {
                errors.push(`<strong>Dominio:</strong> Esperado [${domMin}, ${domMax}]`);
            }

            // 3. Check Image
            let rawImg = el.querySelector('.ans-img').value.replace(/\s/g, '').split(',').map(Number);
            if (rawImg.length !== 2 || rawImg[0] !== imgMin || rawImg[1] !== imgMax) {
                errors.push(`<strong>Imagen:</strong> Esperado [${imgMin}, ${imgMax}]`);
            }

            // 4. Check roots
            let userRootsRaw = el.querySelector('.ans-roots').value.replace(/\s/g, '');
            let userRoots = userRootsRaw ? userRootsRaw.split(',').map(Number).sort((a,b)=>a-b) : [];
            let rootsMatch = userRoots.length === rootsArr.length && userRoots.every((v,i) => Math.abs(v - rootsArr[i]) < 0.05);
            if (!rootsMatch) errors.push(`<strong>Raíces esperadas:</strong> ${rootsArr.length > 0 ? rootsArr.join(', ') : 'Ninguna'}`);

            // Extra checks
            if (isFunction) {
                let signSelects = el.querySelectorAll('.ans-sign');
                let signsOk = true;
                let answeredAny = false;
                signSelects.forEach((sel, i) => {
                    if (sel.value !== '?') answeredAny = true;
                    if (sel.value !== signIntervals[i].expected) signsOk = false;
                });
                if (!signsOk && answeredAny) {
                    errors.push(`<strong>Signos esperados:</strong> ${signIntervals.map(i => `(${i.start};${i.end}) es ${i.expected}`).join(', ')}`);
                } else if (!signsOk && !answeredAny && userIsFunc !== expectedIsFunc) {
                    errors.push(`<strong>Positividad/Negatividad:</strong> Te faltó analizarlo por fallar la clasificación inicial.`);
                }

                let behaviorSelects = el.querySelectorAll('.ans-behavior');
                let behaviorOk = true;
                let behaviorAnswered = false;
                behaviorSelects.forEach((sel, i) => {
                    if (sel.value !== '?') behaviorAnswered = true;
                    if (sel.value !== behaviorIntervals[i].expected) behaviorOk = false;
                });
                if (!behaviorOk && behaviorAnswered) {
                    errors.push(`<strong>Comportamientos esperados:</strong> ${behaviorIntervals.map(i => `[${i.start};${i.end}] es ${i.expected}`).join(', ')}`);
                } else if (!behaviorOk && !behaviorAnswered && userIsFunc !== expectedIsFunc) {
                    errors.push(`<strong>Comportamiento:</strong> Te faltó analizarlo por fallar la clasificación inicial.`);
                }
            }

            const fb = el.querySelector('.feedback');
            if (errors.length === 0) {
                fb.innerHTML = "¡Excelente! Has analizado el gráfico correctamente.";
                return true;
            } else {
                fb.innerHTML = "Hubo errores en tu análisis: <ul>" + errors.map(e => `<li>${e}</li>`).join('') + "</ul>";
                return false;
            }
        }
    };
}

// ==========================================
// LÓGICA PRINCIPAL DE LA APP
// ==========================================
let currentExercises = [];

document.addEventListener('DOMContentLoaded', () => {
    const btnTheory = document.getElementById('btn-theory');
    const btnPractice = document.getElementById('btn-practice');
    const theorySec = document.getElementById('theory-section');
    const practiceSec = document.getElementById('practice-section');

    btnTheory.addEventListener('click', () => {
        btnTheory.classList.add('active');
        btnPractice.classList.remove('active');
        theorySec.classList.add('active');
        practiceSec.classList.remove('active');
    });

    btnPractice.addEventListener('click', () => {
        btnPractice.classList.add('active');
        btnTheory.classList.remove('active');
        practiceSec.classList.add('active');
        theorySec.classList.remove('active');
    });

    const container = document.getElementById('exercises-container');
    const btnRenew = document.getElementById('btn-renew');
    const btnSubmit = document.getElementById('btn-submit');
    const scoreContainer = document.getElementById('score-container');
    const scoreText = document.getElementById('score-text');

    function generateAllExercises() {
        container.innerHTML = '';
        currentExercises = [];
        scoreContainer.classList.add('hidden');
        
        let isFunctionArray = [true, true, true, true, true, true, true, false, false, false];
        isFunctionArray.sort(() => Math.random() - 0.5);

        for (let i = 0; i < 10; i++) {
            let ex = genSuperExercise(i, isFunctionArray[i]);
            currentExercises.push(ex);
            container.appendChild(ex.element);
        }
    }

    btnRenew.addEventListener('click', generateAllExercises);

    btnSubmit.addEventListener('click', () => {
        let score = 0;
        currentExercises.forEach(ex => {
            ex.element.classList.remove('correct', 'incorrect');
            if (ex.check()) {
                score++;
                ex.element.classList.add('correct');
            } else {
                ex.element.classList.add('incorrect');
            }
        });
        
        scoreText.textContent = `${score}/10`;
        scoreContainer.classList.remove('hidden');
        
        window.scrollTo({ top: scoreContainer.offsetTop - 80, behavior: 'smooth' });
    });

    generateAllExercises();
});
