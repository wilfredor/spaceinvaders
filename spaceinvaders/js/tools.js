/*
 
Wilfredo R. Rodriguez H. (wilfredor@gmail.com)

Copyright (C) 2013

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

//------------Tool functions
//Check if a var exist
var isset = function(obj, props) {
 if ((typeof (obj) === 'undefined') || (obj === null))
  return false;
 else if (props && props.length > 0)
  return isset(obj[props.shift()], props);
 else
  return true;
};
//A random number multiple of 5
function randomRange(min, max) {
 return Math.round((Math.random()*(max-min)+min)/5)*5;
}