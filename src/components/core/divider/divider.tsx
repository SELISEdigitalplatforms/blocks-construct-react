type DividerProps = Readonly<{
  text: string;
}>;

export const Divider = ({ text }: DividerProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <hr className="h-[2px] bg-border border-0 rounded" />
      </div>
      <div className="text-base font-normal text-low-emphasis">{text}</div>
      <div className="flex-1">
        <hr className="h-[2px] bg-border border-0 rounded" />
      </div>
    </div>
  );
};
