document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM carregado");

  function mostrarTutorial() {
    const tutorial = document.getElementById('tutorial');
    tutorial.classList.remove('esconder');
  }

  function fecharTutorial() {
    const tutorial = document.getElementById('tutorial');
    tutorial.classList.add('esconder');
    localStorage.setItem('tutorialVisto', 'true');
  }

  const tutorialVisto = localStorage.getItem('tutorialVisto');
  if (!tutorialVisto) {
    mostrarTutorial();
  }

  document.getElementById('fechar-tutorial').addEventListener('click', fecharTutorial);
  document.getElementById('tutorial').addEventListener('click', (e) => {
    if (e.target.id === 'tutorial') {
      fecharTutorial();
    }
  });

  const movimentos = document.getElementById("contagem-movimentos");
  const valorTempo = document.getElementById("tempo");
  const botaoIniciar = document.getElementById("start");
  const botaoParar = document.getElementById("stop");
  const containerJogo = document.querySelector(".container-jogo");
  const resultado = document.getElementById("resultado");
  const controles = document.querySelector(".container-controles");
  const muteButton = document.getElementById('mute-button');
  let cartas;
  let intervalo;
  let primeiraCarta = false;
  let segundaCarta = false;


  const flipSound = new Audio('./assets/sounds/flipcard-91468.mp3');
  const matchSound = new Audio('./assets/sounds/carddrop2-92718.mp3');
  const victorySound = new Audio('./assets/sounds/goodresult-82807.mp3');

  let isMuted = false;

  const itens = [
    { nome: "formiga", imagem: "./assets/img/Ant.svg" },
    { nome: "cachorro", imagem: "./assets/img/Corgi.svg" },
    { nome: "carangueiro", imagem: "./assets/img/Crab.svg" },
    { nome: "raposa", imagem: "./assets/img/Crafty Fox.svg" },
    { nome: "girafa", imagem: "./assets/img/Giraffe Full Body.svg" },
    { nome: "favos-de-mel", imagem: "./assets/img/Honeycombs.svg" },
    { nome: "borboleta", imagem: "./assets/img/Machaon Butterfly.svg" },
    { nome: "ovelha", imagem: "./assets/img/Lamb.svg" },
    { nome: "bicho-preguiça", imagem: "./assets/img/Sloth.svg" },
    { nome: "esquilo", imagem: "./assets/img/Squirrel.svg" },
    { nome: "tartaruga", imagem: "./assets/img/Turtle.svg" },
    { nome: "água-viva", imagem: "./assets/img/Jellyfish.svg" },
  ];

  let segundos = 0,
    minutos = 0;
  let contagemMovimentos = 0,
    contagemVitorias = 0;

  const geradorTempo = () => {
    segundos += 1;
    if (segundos >= 60) {
      minutos += 1;
      segundos = 0;
    }
    let valorSegundos = segundos < 10 ? `0${segundos}` : segundos;
    let valorMinutos = minutos < 10 ? `0${minutos}` : minutos;
    valorTempo.innerHTML = `<span>Tempo: </span>${valorMinutos}:${valorSegundos}`;
  };

  const contadorMovimentos = () => {
    contagemMovimentos += 1;
    movimentos.innerHTML = `<span>Movimentos: </span>${contagemMovimentos}`;
  };

  const gerarAleatorio = (tamanho = 4) => {
    let arrayTemporario = [...itens];
    let valoresCartas = [];
    tamanho = (tamanho * tamanho) / 2;
    for (let i = 0; i < tamanho; i++) {
      const indiceAleatorio = Math.floor(Math.random() * arrayTemporario.length);
      valoresCartas.push(arrayTemporario[indiceAleatorio]);
      arrayTemporario.splice(indiceAleatorio, 1);
    }
    return valoresCartas;
  };

  const geradorMatriz = (valoresCartas, tamanho = 4) => {
    containerJogo.innerHTML = "";
    valoresCartas = [...valoresCartas, ...valoresCartas];
    valoresCartas.sort(() => Math.random() - 0.5);

    for (let i = 0; i < tamanho * tamanho; i++) {
      containerJogo.innerHTML += `
         <div class="container-carta" data-card-value="${valoresCartas[i].nome}">
            <div class="carta-antes">?</div>
            <div class="carta-depois">
            <img src="${valoresCartas[i].imagem}" class="image"/></div>
         </div>
         `;
    }

    containerJogo.style.gridTemplateColumns = `repeat(${tamanho},auto)`;

    cartas = document.querySelectorAll(".container-carta");
    cartas.forEach((carta) => {
      carta.addEventListener("click", () => {
        if (!isMuted) flipSound.play();
        if (!carta.classList.contains("matched") && !carta.classList.contains("virada")) {
          carta.classList.add("virada");
          carta.querySelector('.carta-antes').style.border = 'none';
          carta.querySelector('.carta-depois').style.border = 'none';

          if (!primeiraCarta) {
            primeiraCarta = carta;
            valorPrimeiraCarta = carta.getAttribute("data-card-value");
          } else {
            contadorMovimentos();
            segundaCarta = carta;
            let valorSegundaCarta = carta.getAttribute("data-card-value");

            if (valorPrimeiraCarta === valorSegundaCarta) {
              if (!isMuted) matchSound.play();
              primeiraCarta.classList.add("matched");
              segundaCarta.classList.add("matched");
              primeiraCarta = false;
              contagemVitorias += 1;

              if (contagemVitorias === Math.floor(valoresCartas.length / 2)) {
                setTimeout(() => {
                  if (!isMuted) victorySound.play();
                  resultado.innerHTML = `
                      <h2>Você Venceu!</h2>
                      <h4>Movimentos: ${contagemMovimentos}</h4>
                      <h4>Tempo: ${valorTempo.textContent.split(': ')[1]}</h4>
                    `;
                  pararJogo();
                  controles.classList.add("mostrar");
                }, 500);
              }
            } else {
              let [tempPrimeira, tempSegunda] = [primeiraCarta, segundaCarta];
              primeiraCarta = false;
              segundaCarta = false;

              setTimeout(() => {
                tempPrimeira.classList.remove("virada");
                tempSegunda.classList.remove("virada");
              }, 900);
            }
          }
        }
      });
    });
  };

  function pararJogo() {
    clearInterval(intervalo);
    controles.classList.remove("esconder");
    controles.classList.add("mostrar");
    botaoParar.classList.add("esconder");
    botaoIniciar.classList.remove("esconder");
    document.querySelector('.wrapper').classList.add('esconder');
  }

  function iniciarJogo() {
    console.log("Função iniciarJogo chamada");
    contagemMovimentos = 0;
    segundos = 0;
    minutos = 0;
    contagemVitorias = 0;
    primeiraCarta = false;
    segundaCarta = false;

    controles.classList.remove("mostrar");
    controles.classList.add("esconder");
    botaoParar.classList.remove("esconder");
    botaoIniciar.classList.add("esconder");

    clearInterval(intervalo);
    intervalo = setInterval(geradorTempo, 1000);

    movimentos.innerHTML = `<span>Movimentos:</span> ${contagemMovimentos}`;
    valorTempo.innerHTML = `<span>Tempo:</span> 00:00`;

    document.querySelector('.wrapper').classList.remove('esconder');

    isMuted = false;
    flipSound.muted = false;
    matchSound.muted = false;
    victorySound.muted = false;
    updateMuteButtonIcon();
    muteButton.classList.remove('muted');

    inicializador();
  }

  const inicializador = () => {
    resultado.innerHTML = "";
    containerJogo.innerHTML = "";
    contagemVitorias = 0;
    let valoresCartas = gerarAleatorio();
    geradorMatriz(valoresCartas);
  };

  function updateMuteButtonIcon() {
    const muteIcon = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;

    const unmuteIcon = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 12C17.004 13.3308 16.4774 14.6024 15.54 15.54" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;

    muteButton.innerHTML = isMuted ? muteIcon : unmuteIcon;
  }

  function toggleMute() {
    isMuted = !isMuted;

    flipSound.muted = isMuted;
    matchSound.muted = isMuted;
    victorySound.muted = isMuted;

    updateMuteButtonIcon();

    muteButton.classList.toggle('muted', isMuted);
  }

  muteButton.addEventListener('click', toggleMute);

  updateMuteButtonIcon();

  botaoIniciar.addEventListener("click", () => {
    console.log("Botão iniciar clicado");
    iniciarJogo();
  });
  botaoParar.addEventListener("click", pararJogo);
});