import IconStackbee from '@icons/IconStackbee'

export default () => (
  <h1>
    <sup>welcome to</sup>
    <span className="logoContainer">
      <IconStackbee />
    </span>
    <span className="logoTitle">stackbee.io</span>
    <style jsx>{`
      h1 {
        color: rgba(255, 255, 255, 1);
        text-align: center;
        position: relative;
        padding-bottom: 12px;
        margin-bottom: 32px;
      }

      h1::before {
        content: '';
        display: block;
        background: rgba(66, 66, 66, .25);
        border: 1px solid rgba(33, 33, 33, .6);
        box-shadow: rgba(0, 0, 0, .25) 6px 6px 9px;
        width: 50%;
        max-width: 500px;
        min-width: 300px;
        height: 100%;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
      }

      .logoContainer {
        height: 146px;
        display: block;
        text-align: center;
      }

      .logoTitle {
        position: relative;
        z-index: 2;
      }

      h1 :global(svg) {
        transform: translateY(-168px) scale(.3);
        display: inline-block;
        margin: 0 auto 0;
        position: relative;
      }

      h1 > :global(sup) {
        position: absolute;
        top: 13px;
        left: 50%;
        transform: translateX(-50%) rotateZ(-3deg);
        font-size: .65rem;
        text-transform: uppercase;
        z-index: 2;
      }
    `}</style>
  </h1>
)
