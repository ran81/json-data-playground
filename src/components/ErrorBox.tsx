type Props = {
  error: string | null;
};

export default function ErrorBox({ error }: Props) {
  if (!error) {
    return (
      <div className="p-3 bg-green-100 text-green-800 rounded-lg shadow-sm flex items-center gap-2">
        <span className="font-semibold">✓ JSON is valid</span>
      </div>
    );
  }

  return (
    <div className="p-3 bg-red-100 text-red-800 rounded-lg shadow-sm whitespace-pre-wrap">
      <strong>Error:</strong> {error}
    </div>
  );
}
