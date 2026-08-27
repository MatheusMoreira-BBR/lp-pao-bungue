(function () {
  'use strict';

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var DIALOG_AUTOCLOSE_DELAY_MS = 2200;
  var FOCUS_AFTER_SCROLL_DELAY_MS = 600;

  var VALIDATION_MESSAGES = {
    missingName: 'Preencha seu nome completo.',
    invalidEmail: 'Informe um e-mail válido.',
    missingConsent: 'É preciso aceitar os termos da LGPD.'
  };
  var SUBMIT_SUCCESS_MESSAGE = 'Assinatura registrada. Obrigado por apoiar esse movimento!';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

  /* ---------------------------------------------------------------- FAQ */

  var faqQuestionButtons = document.querySelectorAll('.faq__pergunta');

  function collapseFaqQuestion(questionButton) {
    questionButton.setAttribute('aria-expanded', 'false');
    var answerPanel = document.getElementById(questionButton.getAttribute('aria-controls'));
    if (answerPanel) answerPanel.hidden = true;
  }

  Array.prototype.forEach.call(faqQuestionButtons, function (questionButton) {
    questionButton.addEventListener('click', function () {
      var wasExpanded = questionButton.getAttribute('aria-expanded') === 'true';
      var answerPanel = document.getElementById(questionButton.getAttribute('aria-controls'));

      Array.prototype.forEach.call(faqQuestionButtons, function (otherButton) {
        if (otherButton !== questionButton) collapseFaqQuestion(otherButton);
      });

      questionButton.setAttribute('aria-expanded', String(!wasExpanded));
      if (answerPanel) answerPanel.hidden = wasExpanded;
    });
  });

  /* ------------------------------------------------ Popup de assinatura */

  var signatureDialog = document.getElementById('modal-assinatura');
  var dialogIsSupported = !!signatureDialog && typeof signatureDialog.showModal === 'function';
  var lastDialogTrigger = null;

  function openSignatureDialog(triggerElement) {
    if (!dialogIsSupported) return false;
    lastDialogTrigger = triggerElement;
    signatureDialog.showModal();
    document.body.classList.add('modal-aberto');
    var firstField = signatureDialog.querySelector('.form__input');
    if (firstField) firstField.focus();
    return true;
  }

  function closeSignatureDialog() {
    if (!dialogIsSupported || !signatureDialog.open) return;
    signatureDialog.close();
    document.body.classList.remove('modal-aberto');
  }

  if (dialogIsSupported) {
    var dialogPanel = signatureDialog.querySelector('.modal__caixa');

    signatureDialog.addEventListener('close', function () {
      document.body.classList.remove('modal-aberto');
      if (lastDialogTrigger) {
        lastDialogTrigger.focus();
        lastDialogTrigger = null;
      }
    });

    signatureDialog.addEventListener('click', function (clickEvent) {
      if (dialogPanel && !dialogPanel.contains(clickEvent.target)) closeSignatureDialog();
    });

    Array.prototype.forEach.call(
      signatureDialog.querySelectorAll('[data-modal-fechar]'),
      function (closeButton) {
        closeButton.addEventListener('click', closeSignatureDialog);
      }
    );
  }

  /* --------------------------------------------------- CTAs da página */

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-abre-modal]'),
    function (dialogTriggerLink) {
      dialogTriggerLink.addEventListener('click', function (clickEvent) {
        /* sem <dialog>, o href="#assinar" segue valendo como âncora */
        if (openSignatureDialog(dialogTriggerLink)) clickEvent.preventDefault();
      });
    }
  );

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-rola-para]'),
    function (scrollTriggerLink) {
      scrollTriggerLink.addEventListener('click', function (clickEvent) {
        var scrollTargetForm = document.querySelector(
          scrollTriggerLink.getAttribute('data-rola-para')
        );
        if (!scrollTargetForm) return;

        clickEvent.preventDefault();
        scrollTargetForm.scrollIntoView({ behavior: scrollBehavior, block: 'center' });

        var nameField = scrollTargetForm.querySelector('[name="nome"]');
        if (!nameField) return;

        if (prefersReducedMotion) {
          nameField.focus({ preventScroll: true });
        } else {
          setTimeout(function () {
            nameField.focus({ preventScroll: true });
          }, FOCUS_AFTER_SCROLL_DELAY_MS);
        }
      });
    }
  );

  /* ---------------------------------------------- Formulários da petição */

  function getValidationError(petitionForm) {
    var nameInput = petitionForm.querySelector('[name="nome"]');
    var emailInput = petitionForm.querySelector('[name="email"]');
    var consentCheckbox = petitionForm.querySelector('[name="aceite"]');

    if (!nameInput.value.trim()) return VALIDATION_MESSAGES.missingName;
    if (!EMAIL_PATTERN.test(emailInput.value)) return VALIDATION_MESSAGES.invalidEmail;
    if (!consentCheckbox.checked) return VALIDATION_MESSAGES.missingConsent;
    return '';
  }

  function getStatusMessageElement(petitionForm) {
    var statusMessage = petitionForm.querySelector('.form__aviso');
    if (!statusMessage) {
      statusMessage = document.createElement('p');
      statusMessage.className = 'form__aviso';
      statusMessage.setAttribute('role', 'status');
      petitionForm.appendChild(statusMessage);
    }
    return statusMessage;
  }

  Array.prototype.forEach.call(document.querySelectorAll('.form'), function (petitionForm) {
    petitionForm.addEventListener('submit', function (submitEvent) {
      submitEvent.preventDefault();

      var validationError = getValidationError(petitionForm);
      var statusMessage = getStatusMessageElement(petitionForm);

      if (validationError) {
        statusMessage.textContent = validationError;
        return;
      }

      /* TODO: integrar com o endpoint real de captação da petição */
      statusMessage.textContent = SUBMIT_SUCCESS_MESSAGE;
      petitionForm.reset();

      var wasSubmittedInsideDialog =
        dialogIsSupported && signatureDialog.open && signatureDialog.contains(petitionForm);

      if (wasSubmittedInsideDialog) {
        setTimeout(closeSignatureDialog, DIALOG_AUTOCLOSE_DELAY_MS);
      }
    });
  });
})();
