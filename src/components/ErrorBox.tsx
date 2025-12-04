type Props = {
  error: string | null;
};

export default function ErrorBox({ error }: Props) {
  if (!error) {
    return (
      <div className="p-3 bg-green-100 text-green-700 rounded">
        ✓ JSON is valid
      </div>
    );
  }

  return (
    <div className="p-3 bg-red-100 text-red-700 rounded whitespace-pre-wrap">
      <strong>Error:</strong> {error}
    </div>
  );
}
