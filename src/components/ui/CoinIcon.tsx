import { Doubloon } from '../art/Doubloon';

/** The currency icon: a doubloon. Kept as CoinIcon so callers read naturally. */
export const CoinIcon = ({ size = 18 }: { size?: number }) => <Doubloon size={size} />;
