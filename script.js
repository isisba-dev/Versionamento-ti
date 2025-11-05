
// =================== Conversor Universal de Unidades ===================
// Mantive a lógica das funções originais (apenas ajustes minimos para rodar no browser)

// --- MAPA DE ALIASES (com e sem acento) para evitar erros de grafia ---
const aliasUnidades = {
  // distância
  "metro": "metro", "metros": "metro",
  "quilometro": "quilômetro", "quilômetros": "quilômetro", "quilômetro": "quilômetro", "quilômetros": "quilômetro",
  "quilometro": "quilômetro", "quilometros": "quilômetro",
  "milha": "milha", "milhas": "milha",
  "jarda": "jarda", "jardas": "jarda",
  "pé": "pé", "pe": "pé", "pes": "pé",
  "polegada": "polegada", "polegadas": "polegada",
  // peso
  "grama": "grama", "gramas":"grama",
  "quilo": "quilo", "quilos":"quilo", "kg":"quilo",
  "tonelada": "tonelada", "toneladas":"tonelada",
  "libra":"libra","libras":"libra",
  "onça":"onça","onza":"onça","oncas":"onça",
  // temperatura
  "celsius":"celsius","fahrenheit":"fahrenheit","kelvin":"kelvin"
};

// --- Temperatura ---
function converterTemperatura(valor, de, para) {
    // Primeiro converte para Celsius
    let celsius;
    switch (de.toLowerCase()) {
        case "celsius":
            celsius = valor;
            break;
        case "fahrenheit":
            celsius = (valor - 32) * 5 / 9;
            break;
        case "kelvin":
            celsius = valor - 273.15;
            break;
        default:
            throw new Error("Unidade de temperatura inválida: " + de);
    }

    // Depois converte para a unidade desejada
    switch (para.toLowerCase()) {
        case "celsius":
            return celsius;
        case "fahrenheit":
            return (celsius * 9 / 5) + 32;
        case "kelvin":
            return celsius + 273.15;
        default:
            throw new Error("Unidade de temperatura inválida: " + para);
    }
}

// --- Distância ---
function converterDistancia(valor, de, para) {
    const metros = {
        "metro": 1,
        "quilômetro": 1000,
        "milha": 1609.34,
        "jarda": 0.9144,
        "pé": 0.3048,
        "polegada": 0.0254
    };

    const deLower = de.toLowerCase();
    const paraLower = para.toLowerCase();

    if (!(deLower in metros) || !(paraLower in metros)) {
        throw new Error("Unidade de distância inválida");
    }

    const valorEmMetros = Number(valor) * metros[deLower];
    return valorEmMetros / metros[paraLower];
}

// --- Peso ---
function converterPeso(valor, de, para) {
    const gramas = {
        "grama": 1,
        "quilo": 1000,
        "tonelada": 1000000,
        "libra": 453.592,
        "onça": 28.3495
    };

    const deLower = de.toLowerCase();
    const paraLower = para.toLowerCase();

    if (!(deLower in gramas) || !(paraLower in gramas)) {
        throw new Error("Unidade de peso inválida");
    }

    const valorEmGramas = Number(valor) * gramas[deLower];
    return valorEmGramas / gramas[paraLower];
}

// Função principal (mesma assinatura do script original)
function converter(valor1, unidadeOrigem1, valor2, unidadeOrigem2, unidadeDestino, categoria) {
    let totalConvertido = 0;

    switch (categoria.toLowerCase()) {
        case "temperatura":
            if (valor2 !== null && valor2 !== undefined && valor2 !== "") {
                throw new Error("Conversão de temperatura só aceita um valor.");
            }
            return converterTemperatura(Number(valor1), unidadeOrigem1, unidadeDestino);

        case "distância":
            const parcial1 = converterDistancia(Number(valor1), unidadeOrigem1, unidadeDestino);
            const parcial2 = (valor2 || valor2 === 0) ? converterDistancia(Number(valor2), unidadeOrigem2, unidadeDestino) : 0;
            totalConvertido = parcial1 + parcial2;
            return totalConvertido;

        case "peso":
            const p1 = converterPeso(Number(valor1), unidadeOrigem1, unidadeDestino);
            const p2 = (valor2 || valor2 === 0) ? converterPeso(Number(valor2), unidadeOrigem2, unidadeDestino) : 0;
            totalConvertido = p1 + p2;
            return totalConvertido;

        default:
            throw new Error("Categoria de conversão inválida");
    }
}

// ------------------- Script de interface -------------------
const unidadesPorCategoria = {
  'distância': ['metro','quilômetro','milha','jarda','pé','polegada'],
  'peso': ['grama','quilo','tonelada','libra','onça'],
  'temperatura': ['celsius','fahrenheit','kelvin']
};

const categoriaEl = document.getElementById('categoria');
const unidade1El = document.getElementById('unidade1');
const unidade2El = document.getElementById('unidade2');
const destinoEl = document.getElementById('destino');
const valor1El = document.getElementById('valor1');
const valor2El = document.getElementById('valor2');
const blocoValor2 = document.getElementById('blocoValor2');
const saidaTexto = document.getElementById('saidaTexto');
const historiaLista = document.getElementById('historiaLista');
const historico = [];

// popula selects com opções
function popularUnidades(cat) {
  const list = unidadesPorCategoria[cat];
  unidade1El.innerHTML = '';
  unidade2El.innerHTML = '';
  destinoEl.innerHTML = '';
  list.forEach(u => {
    const opt1 = document.createElement('option'); opt1.value = u; opt1.textContent = u;
    const opt2 = document.createElement('option'); opt2.value = u; opt2.textContent = u;
    const opt3 = document.createElement('option'); opt3.value = u; opt3.textContent = u;
    unidade1El.appendChild(opt1);
    unidade2El.appendChild(opt2);
    destinoEl.appendChild(opt3);
  });

  if (cat === 'temperatura') blocoValor2.style.display = 'none';
  else blocoValor2.style.display = 'block';
}

categoriaEl.addEventListener('change', () => popularUnidades(categoriaEl.value));

// trata aliases: transforma entradas do usuário em chaves aceitas pelas funções
function normalizarUnidade(raw) {
  if (!raw) return raw;
  const key = raw.toLowerCase().normalize('NFC').replace(/\s+/g, '');
  // tentativa direta
  if (aliasUnidades[key]) return aliasUnidades[key];
  // tentar match por remoção de acentos
  const semAcento = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (aliasUnidades[semAcento]) return aliasUnidades[semAcento];
  // se não encontrou, retorna raw (pode causar erro na função e será tratado)
  return raw.toLowerCase();
}

document.getElementById('btnConverter').addEventListener('click', () => {
  try {
    const cat = categoriaEl.value;
    const v1 = valor1El.value;
    const u1 = normalizarUnidade(unidade1El.value);
    const v2raw = valor2El.value === '' ? null : valor2El.value;
    const u2 = v2raw ? normalizarUnidade(unidade2El.value) : null;
    const dest = normalizarUnidade(destinoEl.value);

    const resultado = converter(v1, u1, v2raw, u2, dest, cat);

    let texto;
    if (cat === 'temperatura') texto = `${Number(resultado).toFixed(2)} ${dest}`;
    else texto = `${Number(resultado).toFixed(6)} ${dest}`;

    // mostrar e adicionar ao histórico
    saidaTexto.textContent = texto;
    historico.unshift(`${v1} ${u1}${v2raw ? ' + ' + v2raw + ' ' + u2 : ''} → ${texto}`);
    atualizarHistorico();
  } catch (err) {
    saidaTexto.textContent = 'Erro: ' + err.message;
  }
});

document.getElementById('btnExemplo').addEventListener('click', () => {
  // Exemplo: Distância - 2 milhas + 100 jardas para quilômetros
  categoriaEl.value = 'distância';
  popularUnidades('distância');
  valor1El.value = 2; unidade1El.value = 'milha';
  valor2El.value = 100; unidade2El.value = 'jarda';
  destinoEl.value = 'quilômetro';
  document.getElementById('btnConverter').click();
});

// abas (resultado / histórico)
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tabcontent').forEach(tc => tc.style.display = 'none');
    document.getElementById(tab).style.display = 'block';
  });
});

function atualizarHistorico() {
  if (historico.length === 0) {
    historiaLista.textContent = 'Nenhuma conversão ainda.';
    return;
  }
  historiaLista.innerHTML = historico.map(h => `<div style="margin-bottom:6px">${h}</div>`).join('');
}

// inicializa
popularUnidades(categoriaEl.value);
atualizarHistorico();
// FInal do script.