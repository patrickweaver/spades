import React from "react";

class Prompt extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const submit = (
      <button
        className="prompt-button"
        onClick={() => {
          const promptInput = document.getElementById("prompt-input").value;
          return this.props.onSubmitPrompt(promptInput);
        }}
      >
        &nbsp;&nbsp;&nbsp;→&nbsp;&nbsp;&nbsp;
      </button>
    );
    switch (this.props.type) {
      case "text":
        var options = (
          <div>
            <input id="prompt-input" type="text" />
            <br />
            {submit}
          </div>
        );
        break;

      case "options":
        var options = this.props.options.map((option, index) => (
          <button
            className="prompt-button"
            key={index}
            onClick={() => this.props.onSubmitPrompt({ option })}
          >
            {option}
          </button>
        ));
        break;
    }

    var promptInput = <div id="options-container">{options}</div>;

    return (
      <div id="prompt">
        <p>{this.props.question}</p>
        {promptInput}
      </div>
    );
  }
}

export default Prompt;
