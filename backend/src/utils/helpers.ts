import chalk from 'chalk';

export const terminalLog = (message: string): void => {
  console.log(chalk.green.dim(message));
};