import { useState } from 'react';
import { Scenario } from '@data/scenarios';
import './ScenarioStepper.css';

interface ScenarioStepperProps {
  scenario: Scenario;
}

export default function ScenarioStepper({ scenario }: ScenarioStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const goToNextStep = () => {
    if (currentStep < scenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = scenario.steps[currentStep];

  return (
    <div className="scenario-stepper">
      <header className="scenario-stepper__header">
        <h3 className="scenario-stepper__title">{scenario.title}</h3>
        <p className="scenario-stepper__description">{scenario.description}</p>
      </header>

      <div className="scenario-stepper__progress">
        <div className="scenario-stepper__progress-bar">
          <div
            className="scenario-stepper__progress-fill"
            style={{ width: `${((currentStep + 1) / scenario.steps.length) * 100}%` }}
            role="progressbar"
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={scenario.steps.length}
          />
        </div>
        <span className="scenario-stepper__progress-text">
          단계 {currentStep + 1} / {scenario.steps.length}
        </span>
      </div>

      <div className="scenario-stepper__step">
        <div className="scenario-stepper__step-header">
          <span className="scenario-stepper__layer-badge">{step.layer}</span>
        </div>
        <p className="scenario-stepper__step-description">{step.description}</p>
        {step.code && (
          <pre className="scenario-stepper__code">
            <code>{step.code}</code>
          </pre>
        )}
      </div>

      <nav className="scenario-stepper__controls" aria-label="시나리오 단계 탐색">
        <button
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
          className="scenario-stepper__button scenario-stepper__button--prev"
          aria-label="이전 단계"
        >
          ← 이전
        </button>
        <div className="scenario-stepper__dots">
          {scenario.steps.map((_step, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`scenario-stepper__dot ${
                index === currentStep ? 'scenario-stepper__dot--active' : ''
              }`}
              aria-label={`단계 ${index + 1}로 이동`}
              aria-current={index === currentStep ? 'step' : undefined}
            />
          ))}
        </div>
        <button
          onClick={goToNextStep}
          disabled={currentStep === scenario.steps.length - 1}
          className="scenario-stepper__button scenario-stepper__button--next"
          aria-label="다음 단계"
        >
          다음 →
        </button>
      </nav>
    </div>
  );
}
