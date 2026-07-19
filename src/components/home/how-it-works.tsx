import styles from './home.module.css';

const steps = [
  ['01', 'Open the official link', 'Visit the activation page on the phone where Kira is installed.'],
  ['02', 'Choose your sources', 'Reveal source management and enable only the options you want.'],
  ['03', 'Build your library', 'Save a title, start reading, and download chapters for later.'],
] as const;

export function HowItWorks() {
  return (
    <section className={`${styles.stepsSection} shell`} aria-labelledby="steps-title">
      <header>
        <p className={styles.sectionKicker}><span />Start in minutes</p>
        <h2 id="steps-title">From install to<br /><em>chapter one.</em></h2>
      </header>
      <ol>
        {steps.map(([number, title, text]) => (
          <li key={number}>
            <span>{number}</span>
            <div><h3>{title}</h3><p>{text}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}
