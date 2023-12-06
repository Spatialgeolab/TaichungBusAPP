import "./backDrop.css";
import ReactDOM from "react-dom";
// 獲取backDrop根節點
const backDropRoot = document.getElementById("bg-root");
const BackDrop = (props) => {
  const { setShowFavorite } = props;
  return ReactDOM.createPortal(
    <div
      className='bg-drop'
      onClick={(e) => {
        setShowFavorite(false);
      }}>
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}>
        {props.children}
      </div>
    </div>,
    backDropRoot
  );
};

export default BackDrop;
