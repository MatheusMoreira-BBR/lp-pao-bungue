(function () {
  'use strict';

  var perguntas = document.querySelectorAll('.faq__pergunta');

  Array.prototype.forEach.call(perguntas, function (botao) {
    botao.addEventListener('click', function () {
      var aberto = botao.getAttribute('aria-expanded') === 'true';
      var painel = document.getElementById(botao.getAttribute('aria-controls'));

      Array.prototype.forEach.call(perguntas, function (outro) {
        if (outro === botao) return;
        outro.setAttribute('aria-expanded', 'false');
        var p = document.getElementById(outro.getAttribute('aria-controls'));
        if (p) p.hidden = true;
      });

      botao.setAttribute('aria-expanded', String(!aberto));
      if (painel) painel.hidden = aberto;
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll('.form'), function (form) {
    form.addEventListener('submit', function (evento) {
      evento.preventDefault();

      var nome   = form.querySelector('[name="nome"]');
      var email  = form.querySelector('[name="email"]');
      var aceite = form.querySelector('[name="aceite"]');

      var erro = '';
      if (!nome.value.trim())                     erro = 'Preencha seu nome completo.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) erro = 'Informe um e-mail válido.';
      else if (!aceite.checked)                   erro = 'É preciso aceitar os termos da LGPD.';

      var aviso = form.querySelector('.form__aviso');
      if (!aviso) {
        aviso = document.createElement('p');
        aviso.className = 'form__aviso';
        aviso.setAttribute('role', 'status');
        form.appendChild(aviso);
      }

      if (erro) {
        aviso.textContent = erro;
        return;
      }

      /* TODO: integrar com o endpoint real de captação da petição */
      aviso.textContent = 'Assinatura registrada. Obrigado por apoiar esse movimento!';
      form.reset();
    });
  });
})();
