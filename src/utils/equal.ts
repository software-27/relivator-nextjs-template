// Function to determine whether two sets are equal or not.
export const setsAreEqual = <T>(lhs: Set<T>, rhs: Set<T>) => {
  return lhs.size === rhs.size && [...lhs].every((value) => rhs.has(value));
};
