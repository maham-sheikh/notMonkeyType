import { Opulento } from "uvcanvas";

export default function Background() {
  return (
    <div className="absolute top-0 left-0 w-full h-full ">
      <Opulento />
      <div className="absolute top-0 left-0 w-full h-full bg-black/40"></div>
    </div>
  );
}
