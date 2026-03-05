export async function validateResponse(
  response: string,
  context: string,
): Promise<{ response: string; warning?: string }> {
  const suspiciousPhrases = [
    'you can also',
    'additionally',
    'furthermore',
    'another option is',
  ];

  const mightBeHallucinating = suspiciousPhrases.some((phrase) =>
    response.toLowerCase().includes(phrase),
  );

  const genericPhrases = [
    'typically',
    'usually',
    'in general',
    'most platforms',
  ];

  const isTooGeneric = genericPhrases.some((phrase) =>
    response.toLowerCase().includes(phrase),
  );

  let warning;
  if (mightBeHallucinating) {
    warning = 'WARNING: Response might contain information not in docs';
  } else if (isTooGeneric) {
    warning = 'WARNING: Response is generic, might need better context';
  }

  return { response, warning };
}
