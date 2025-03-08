import styles from "@/styles/Home.module.css";
import Calender from "../../components/Calender/Calender";

export default function Home() {
  return (
    <div className={styles.parent}>
      <Calender />
    </div>
  );
}
