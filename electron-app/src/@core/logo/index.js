import classNames from 'class-names'
import Link from 'next/link'
import IconStackbee from '@icons/IconStackbee'
import { colors, spacings, fontSizes, zIndexes } from '@styles'

export const LogoSmall = ({ sticker }) => (
  <div title="stackbee.io" className={classNames({ 'sticker': sticker, 'nonSticker': !sticker })}>
    {sticker && <Link href="/start"><IconStackbee /></Link>}
    {!sticker && <IconStackbee />}

    <style jsx>{`
      div {
        width: ${spacings.grande};
        height: ${spacings.grande};
      }
      div > :global(svg) {
        transform: scale(.06);
        transform-origin: top left;
      }
      .nonSticker {
        display: inline-block;
        vertical-align: middle;
        position: relative;
        margin-left: ${spacings.small};
        height: 15px;
        top: -9px;
      }
      .sticker {
        position: absolute;
        bottom: -4px;
        right: -4px;
        overflow: hidden;
        cursor: pointer;
        z-index: ${zIndexes.top};
      }
    `}</style>
  </div>
)

export default () => (
  <h1>
    <span className="logoContainer">
      <IconStackbee />
    </span>
    <span className="logoTitle">stackbee.io</span>
    <style jsx>{`
      h1 {
        color: ${colors.logoText};
        text-align: center;
        position: relative;
        padding-bottom: ${spacings.medium};
        margin-bottom: ${spacings.grande};
        margin-top: 0;
      }

      .logoContainer {
        height: 136px;
        display: block;
        text-align: center;
      }

      .logoTitle {
        position: relative;
        z-index: ${zIndexes.medium};
      }

      h1 :global(svg) {
        transform: scale(.25);
        transform-origin: top center;
      }
    `}</style>
  </h1>
)
