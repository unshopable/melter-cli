import { Command, Flags } from '@oclif/core';
import { Compilation, loadConfig, melter } from '@unshopable/melter';

export default class Melter extends Command {
  static flags = {
    watch: Flags.boolean({
      char: 'w',
      description: 'Enter watch mode, which rebuilds on file change',
      required: false,
    }),

    version: Flags.version(),
    help: Flags.help(),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Melter);

    const { config, warnings, errors } = loadConfig();

    const compiler = melter(config || {});

    compiler.hooks.compilation.tap('MelterCLI', (compilation: Compilation) => {
      if (errors.length > 0) {
        errors.forEach((error) => {
          compilation.addError(error);
        });
      } else if (warnings.length > 0) {
        warnings.forEach((warning) => {
          compilation.addWarning(warning);
        });
      }
    });

    if (flags.watch) {
      compiler.watch();
    } else {
      compiler.build();
    }
  }
}
