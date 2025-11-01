import { GlossaryEntry } from '@data/glossary';
import './GlossaryCard.css';

interface GlossaryCardProps {
  entry: GlossaryEntry;
}

export default function GlossaryCard({ entry }: GlossaryCardProps) {
  return (
    <article className="glossary-card">
      <header className="glossary-card__header">
        <h3 className="glossary-card__term">{entry.term}</h3>
        <span className="glossary-card__term-en" title={entry.termEn}>
          {entry.termEn}
        </span>
      </header>
      <div className="glossary-card__content">
        <p className="glossary-card__definition">{entry.definition}</p>
        {entry.example && (
          <div className="glossary-card__example">
            <span className="glossary-card__example-label">예제:</span>
            <code>{entry.example}</code>
          </div>
        )}
      </div>
    </article>
  );
}
