const Groq = require('groq-sdk');
const vm = require('vm');
const util = require('util');
const os = require('os');
const path = require('path');
const fs = require('fs/promises');
const { spawn } = require('child_process');

const model = process.env.GROQ_MODEL || 'llama3-70b-8192';

let groqClient = null;

const getGroqClient = () => {
  if (groqClient) return groqClient;

  if (!process.env.GROQ_API_KEY) {
    const err = new Error('GROQ_API_KEY is not configured on the server.');
    err.statusCode = 500;
    throw err;
  }

  groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
};

const getContent = (response) => {
  return response?.choices?.[0]?.message?.content?.trim() || 'No response generated.';
};

const askGroq = async (systemPrompt, userPrompt) => {
  const completion = await getGroqClient().chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  return getContent(completion);
};

const detectErrors = async ({ code, language }) => {
  const systemPrompt =
    'You are an expert programming mentor. Identify syntax and logic issues clearly for beginners. Respond in bullet points with severity labels.';
  const userPrompt = `Language: ${language}\n\nCode:\n${code}`;
  return askGroq(systemPrompt, userPrompt);
};

const getSuggestions = async ({ code, language }) => {
  const systemPrompt =
    'You are an expert programming mentor. Suggest practical code improvements for readability, performance, and maintainability in beginner-friendly language.';
  const userPrompt = `Language: ${language}\n\nCode:\n${code}`;
  return askGroq(systemPrompt, userPrompt);
};

const explainCode = async ({ code, language }) => {
  const systemPrompt =
    'You are a patient instructor. Explain what this code does step by step in simple language, and include key concepts being used.';
  const userPrompt = `Language: ${language}\n\nCode:\n${code}`;
  return askGroq(systemPrompt, userPrompt);
};

const stringifyArg = (arg) => {
  if (typeof arg === 'string') return arg;
  return util.inspect(arg, { depth: 2, breakLength: 120, colors: false });
};

const executeJavaScript = ({ code }) => {
  const output = [];
  const sandboxConsole = {
    log: (...args) => output.push(args.map(stringifyArg).join(' ')),
    info: (...args) => output.push(args.map(stringifyArg).join(' ')),
    warn: (...args) => output.push(`WARN: ${args.map(stringifyArg).join(' ')}`),
    error: (...args) => output.push(`ERROR: ${args.map(stringifyArg).join(' ')}`),
  };

  const sandbox = {
    console: sandboxConsole,
    Math,
    Date,
    JSON,
    Number,
    String,
    Boolean,
    Array,
    Object,
  };

  try {
    const script = new vm.Script(code, { filename: 'snippet.js' });
    const result = script.runInNewContext(sandbox, { timeout: 2000 });

    if (typeof result !== 'undefined') {
      output.push(`Result: ${stringifyArg(result)}`);
    }

    return {
      supported: true,
      output: output.length ? output.join('\n') : 'Code executed successfully (no output).',
    };
  } catch (error) {
    return {
      supported: true,
      output: `Execution error: ${error.message}`,
    };
  }
};

const executePython = async ({ code }) => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-genius-'));
  const filePath = path.join(tempDir, 'snippet.py');
  await fs.writeFile(filePath, code, 'utf8');

  const commands = process.platform === 'win32'
    ? [
        { command: 'python', args: [filePath] },
        { command: 'py', args: ['-3', filePath] },
      ]
    : [
        { command: 'python3', args: [filePath] },
        { command: 'python', args: [filePath] },
      ];

  const runCommand = ({ command, args }) =>
    new Promise((resolve, reject) => {
      const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';
      let finished = false;

      const complete = (value, isError = false) => {
        if (finished) return;
        finished = true;
        if (isError) {
          reject(value);
        } else {
          resolve(value);
        }
      };

      const timeoutId = setTimeout(() => {
        child.kill('SIGKILL');
        complete(new Error('Execution timed out after 2 seconds.'), true);
      }, 2000);

      child.stdout.on('data', (chunk) => {
        if (stdout.length < 64000) {
          stdout += chunk.toString();
        }
      });

      child.stderr.on('data', (chunk) => {
        if (stderr.length < 64000) {
          stderr += chunk.toString();
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        complete(error, true);
      });

      child.on('close', (exitCode) => {
        clearTimeout(timeoutId);
        complete({ exitCode, stdout, stderr });
      });
    });

  try {
    let lastResult = null;

    for (const entry of commands) {
      try {
        const result = await runCommand(entry);
        lastResult = result;
        break;
      } catch (error) {
        if (error.code === 'ENOENT') {
          continue;
        }
        throw error;
      }
    }

    if (!lastResult) {
      return {
        supported: false,
        output: 'Python runtime not found on server. Install Python and ensure `python` or `py` is available in PATH.',
      };
    }

    const combinedOutput = [lastResult.stdout.trim(), lastResult.stderr.trim()]
      .filter(Boolean)
      .join('\n');

    if (lastResult.exitCode !== 0) {
      return {
        supported: true,
        output: combinedOutput || `Execution failed with exit code ${lastResult.exitCode}.`,
      };
    }

    return {
      supported: true,
      output: combinedOutput || 'Code executed successfully (no output).',
    };
  } catch (error) {
    return {
      supported: true,
      output: `Execution error: ${error.message}`,
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
};

const executeCode = async ({ code, language }) => {
  const normalizedLanguage = String(language || '').toLowerCase();

  if (normalizedLanguage === 'javascript' || normalizedLanguage === 'typescript') {
    return executeJavaScript({ code });
  }

  if (normalizedLanguage === 'python') {
    return executePython({ code });
  }

  return {
    supported: false,
    output: `Code execution for ${language} is not enabled yet. Currently supported: JavaScript, TypeScript (JS-compatible syntax), Python.`,
  };
};

module.exports = {
  detectErrors,
  getSuggestions,
  explainCode,
  executeCode,
};
