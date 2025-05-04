import styles from "./background.module.css";
import grid from "../../assets/grid.svg";
import stains from "../../assets/stains1.png";

const Background = () => {
  return (
    <div className={styles.background}>
      <div className={styles.mask}>
        <img src={grid} />
      </div>
      <img src={stains} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
};

export default Background;
