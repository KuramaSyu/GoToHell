import styles from './Card.module.css';

const Card = () => {
  return (
    <div
      className={`${styles.card} p-6 max-w-sm mx-auto border border-gray-300`}
    >
      <h2 className={`${styles.title} text-xl font-bold`}>
        React + CSS Example
      </h2>
      <p className={`${styles.description} mt-2 text-gray-600`}>
        This is a card with both Tailwind and CSS Modules for styling.
      </p>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700">
        Click Me
      </button>
    </div>
  );
};

export default Card;
