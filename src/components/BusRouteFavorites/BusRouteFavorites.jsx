import "./BusRouteFavorites.css";
import BackDrop from "../BackDrop/BackDrop";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
const BusRouteFavorites = ({ setShowFavorite, busFavoriteItem, addFavoriteRoute, setInputBus }) => {
  return (
    // BD透過react portal渲染其InnerText
    <BackDrop setShowFavorite={setShowFavorite}>
      <div className='favorite-container'>
        <span
          className='close-btn'
          onClick={() => {
            setShowFavorite(false);
          }}>
          X
        </span>
        <h2>我的收藏路線</h2>
        <br />
        <ul className='favorite-ul'>
          {busFavoriteItem.map((item) => {
            return (
              <li>
                <span>
                  <FontAwesomeIcon
                    icon={faStarSolid}
                    onClick={(e) => {
                      addFavoriteRoute(item.RouteId);
                    }}
                  />
                </span>
                <div
                  onClick={() => {
                    setInputBus(item.RouteId);
                    setShowFavorite(false);
                  }}>
                  <span>{item.RouteId}</span>
                  <span>{item.RouteName}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </BackDrop>
  );
};

export default BusRouteFavorites;
