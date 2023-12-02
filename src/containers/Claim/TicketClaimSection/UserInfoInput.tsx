const UserInfoInput = ({ data, label }: { data: string; label: string }) => {
  return (
    <div className="w-full">
      <h4 className="font-medium">{label}</h4>
      <div className=" w-full border-b border-b-slate-300 bg-white pt-2 pb-0">
        {data}
      </div>
    </div>
  )
}

export default UserInfoInput
