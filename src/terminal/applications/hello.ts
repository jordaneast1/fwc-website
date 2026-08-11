import FileSystemBash, { FileSystemType } from "../fileSystemBash";

export default function hello(
  print: (s: string, md?: boolean) => void,
  path: FileSystemType
) {
  const fileSystem = FileSystemBash();
  const docs = {
    name: "hello",
    short: "friendly greeting program",
    long: "",
  };

  const app = (args: string[], options: string[]) => {
    if (options.find((o) => o === "-h" || o === '-help')) {
      print(`\n${docs.name} – ${docs.short}`);
      return;
    }

    print("\nHello, how are you? I hope you are having a good day. If you are not, I hope it gets better soon.");
  };
  return { docs, app };
}
