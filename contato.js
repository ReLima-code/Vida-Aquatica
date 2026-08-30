// Envio do formulário de contato (usa o Formspree)
// IMPORTANTE: o endpoint do formulário fica no "action" do <form>, no index.html.
// Antes de publicar, trocar "SEU_ENDPOINT" pelo endereço criado no Formspree.

const form = document.getElementById('contactForm');
const btn = document.getElementById('sendBtn');
const feedback = document.getElementById('formFeedback');
const endpoint = form.getAttribute('action');
const emailFallback = 'mailto:contato@vidaaquatica.com.br';

function mostrarMensagem(texto, deuCerto) {
  feedback.textContent = texto;
  feedback.className = 'feedback ' + (deuCerto ? 'ok' : 'err');
}

function formularioValido() {
  if (!form.reportValidity()) return false;

  const nome = form.name.value.trim();
  const mensagem = form.message.value.trim();
  const aceitou = document.getElementById('consent').checked;

  if (nome.length < 2) {
    mostrarMensagem('Informe seu nome.', false);
    return false;
  }
  if (mensagem.length < 10) {
    mostrarMensagem('Mensagem muito curta (mínimo 10 caracteres).', false);
    return false;
  }
  if (!aceitou) {
    mostrarMensagem('Confirme a autorização de contato.', false);
    return false;
  }

  // Honeypot: campo escondido que só um robô preencheria.
  // Se estiver preenchido, finge sucesso e não envia nada.
  if (form._gotcha.value) {
    mostrarMensagem('Mensagem enviada!', true);
    return false;
  }

  return true;
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!formularioValido()) return;

  btn.disabled = true;
  form.classList.add('is-sending');

  try {
    const dados = new FormData(form);
    dados.append('_subject', form.subject.value || 'Contato via site');
    dados.append('_replyto', form.email.value);

    const resposta = await fetch(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: dados
    });

    if (resposta.ok) {
      form.reset();
      mostrarMensagem('Obrigado! Recebemos sua mensagem e entraremos em contato em breve.', true);
    } else {
      mostrarMensagem('Não foi possível enviar pelo formulário. Abrindo seu e-mail...', false);
      const corpo = encodeURIComponent(
        `Nome: ${form.name.value}\nE-mail: ${form.email.value}\nAssunto: ${form.subject.value}\n\n${form.message.value}`
      );
      window.location.href = `${emailFallback}?subject=Contato%20via%20site&body=${corpo}`;
    }
  } catch (erro) {
    mostrarMensagem('Erro de conexão. Tente novamente ou envie por e-mail.', false);
  } finally {
    btn.disabled = false;
    form.classList.remove('is-sending');
  }
});
