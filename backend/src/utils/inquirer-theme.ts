import chalk from 'chalk';
import inquirer from 'inquirer';

// Override inquirer prompt theme
const originalPrompt = inquirer.prompt;
(inquirer as any).prompt = async (questions: any, ...rest: any) => {
  if (Array.isArray(questions)) {
    questions = questions.map(q => ({
      ...q,
      prefix: chalk.white('?'),
      message: chalk.white(q.message),
      choices: q.choices?.map((c: any) => 
        typeof c === 'string' 
          ? chalk.white(c)
          : { ...c, name: chalk.white(c.name) }
      )
    }));
  }
  return originalPrompt(questions, ...rest);
};

export const inquirerTheme = {
  input: chalk.white,
  question: chalk.white,
  prefix: chalk.white('?'),
}; 